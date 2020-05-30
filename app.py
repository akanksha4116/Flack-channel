from flask import Flask, jsonify, render_template, request, url_for, send_from_directory
from flask_socketio import SocketIO, send, emit

app=Flask(__name__)
app.config.update(
    DEBUG=True,
    TEMPLATES_AUTO_RELOAD =True,
    EXPLAIN_TEMPLATE_LOADING=True
)
app.config['TEMPLATES_AUTO_RELOAD'] = True
socketio=SocketIO(app)
channels={
    'general':[]
}
users={
    'general':[]

}
messages=[]
typing_users={
    'general':[]
}

def get_channels():
    res=[]
    for keys in channels.keys():
        res.append(keys)
        
    return res

def append_message(list,msg):
 if len(list) == 100:
  list.pop(0)
 else:
  list.append(msg)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/checkuser", methods=["POST"])
def checkuser():
    UserName=request.form.get("username")
    usernames={"admin"}
    print(users.keys())
    for key,value in users.items():
        for user in value:
            usernames.add(user)
        print(usernames)    
    if UserName in usernames:
        return jsonify({"exists":True})
    else:
        return jsonify({"exists":False})

@socketio.on('send_message')
def handle_message(msg):
    if "connection" in msg  and not msg["username"]==None and msg["username"] not in users[msg["channel"]]:
        message={
            "connection":True,
            "text":"connected",
            "username": msg['username'],
			"date": msg['date'],
			"channel": msg['channel'],
			"files": {}
        }
        
        users[msg["channel"]].append(msg["username"])
        append_message(channels[msg["channel"]],message)
        print(channels[msg['channel']])
        emit('announce_message', {'messages': channels[msg['channel']]}, broadcast=True)
        	
    elif "connection" in msg and msg['username'] in users[msg['channel']]:
        
	    emit('announce_message', {'messages': channels[msg['channel']]})
    elif "connection" not in msg:
        print("1")
        message = {
			"connection": False,
			"text": msg['text'],
			"username": msg['username'],
			"date": msg['date'],
			"channel": msg['channel']
			
		}
        append_message(channels[msg['channel']], message)
        print(channels[msg['channel']])
        emit('announce_message', message, broadcast=True)

@socketio.on("change_username")
def change_username(msg):
    old_username=msg['old_username']
    new_username=msg['new_username']
    
    for channel in channels.keys():
        for n,msg in enumerate(channels[channel]):
            if(msg['username']==old_username):
             channels[channel][n]["username"] = new_username
    
    for channel in users.keys():
        for n,msg in enumerate(users[channel]):
            message = {
					"connection": True,
					"text": f"is now {new_username}",
					"username": old_username,
				#	"date": msg['date'],
					'channel': channel
				}
            append_message(channels[channel], message)
            users[channel][n] = new_username
        print(channels[channel]) 
        emit('announce_message', {'messages': channels[channel]},broadcast=True)


@socketio.on('add_channel')
def add_channel(msg):
    if(msg['channel'] not in channels):
      channels[msg['channel']]=[]
      users[msg['channel']]=[]
      print(channels)
      emit('added_channel',{'message' : msg['channel']},broadcast=True)

@socketio.on('get all channels')
def get_all_channels(msg):
	emit('all_channels', {'channels': get_channels()})

@socketio.on("type")
def on_type(msg):
	username = msg['username']
	channel = msg['channel']
	if msg['status'] == "end":
		if msg['username'] in typing_users[msg['channel']]:
			typing_users[msg['channel']].remove(msg['username'])

		message = {
			"usernames": typing_users[channel],
			"channel": channel,
			"files": {}
		}

		emit('typing', message, broadcast=True)
	else:
		if channel not in typing_users:
			typing_users[channel] = []
		if username not in typing_users[channel]:
			typing_users[channel].append(username)

		message = {
			"usernames": typing_users[channel],
			"channel": channel,
			"files": {}
		}

		emit('typing', message, broadcast=True)


if __name__ == '__main__':
	socketio.run(app)