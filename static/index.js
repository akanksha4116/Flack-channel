$(document).ready(function(){
    //autolinker
    var autolinker = new Autolinker( {
        urls : {
            schemeMatches : true,
            wwwMatches    : true,
            tldMatches    : true
        },
        email       : true,
        phone       : true,
        mention     : 'instagram',
        hashtag     : 'instagram',
    
        stripPrefix : true,
        stripTrailingSlash : true,
        newWindow   : true,
    
        truncate : {
            length   : 0,
            location : 'end'
        },
    
        className : ''
    } );

    
   $("#username-form").modal({backdrop: 'static', keyboard: false},'show');

   var months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
   //to get date

   $(window).on('resize', function () {
    var height = window.innerHeight - 56;
    $("#main-div").css('height', height);
    height -= 64;
    $("#messages").css('height', height);
});
   function get_date(){
      
        var date =new Date();

            var day=date.getDate();
            var month =months[date.getMonth()];
            var hours = date.getHours();
            var minutes = date.getMinutes();
            if (minutes / 10 < 1) {
                return `${day} ${month}  ${hours}:0${minutes}`;
            } else {
                 return `${day} ${month}  ${hours}:${minutes}`;
            }
    }
   
    
    //Testing purpose
    localStorage.clear();

    // set local storage for current channel
    if (!localStorage.getItem('currentChannel')) {
        localStorage.setItem('currentChannel', "general");
    }
    
    
    if(!localStorage.getItem('username')||localStorage.getItem('username') === ""){
        $('#username-form').modal({
            backdrop: 'static',
            keyboard: false
        });
    } else {
        $("#username-btn").html(localStorage.getItem('username'));
    }
    
    //To Change Username

    $("#username-btn").on('click', function () {
       

        $("#change-username-form").modal({backdrop: 'static', keyboard: false},'show');
    });

    $("#username-btn").hover(function(){
        $(this).html('Change')

    },function () {
        $(this).html(localStorage.getItem('username'));
    });


   
   var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    $("#start").on('click',function(){
        console.log("click");
      
      if($("#username-input").prop('value')==="")
       {
        $(".username-alert").css("display", "block");
       }
      else{
          var date= get_date();
                   const  request=new XMLHttpRequest();
          request.open("POST","/checkuser")
           
          request.onload = () => {
          const data=    JSON.parse(request.responseText);
          
         if(!data.exists)
         {  //username don't exists
         
         localStorage.setItem('username',$("#username-input").val())
         
         $("#username-btn").html(localStorage.getItem('username'));

         $("#username-form").modal('hide');

         socket.emit('send_message', {
            "connection": true,
            "channel": localStorage.getItem('currentChannel'),
            "username": localStorage.getItem('username'),
            "date": date
           });

         }
        else // username exits
        {
            $(".user-exists-alert").css("display", "block");
        }
    }//request.onload() close tag

    //Add data to send
      data=new FormData();
      data.append('username',$("#username-input").val())
      //Request send for checking user
      request.send(data)
      }
        



   });

   $("#change-btn").on('click', function () {
       date=get_date();
    if ($("#change-username-input").prop("value") === "") {
        $(".change-username-alert").css("display", "block");
    } else {
        // Initialize new request
        const request = new XMLHttpRequest();
        request.open('POST', '/checkuser');

        // Callback function for when request completes
        request.onload = () => {

            // Extract JSON data from request
            const data = JSON.parse(request.responseText);
               
            // Update the result div
            if (!data.exists) {
                let old_username = localStorage.getItem('username');
                $(".change-username-alert").css("display", "none");
                localStorage.setItem('username', $("#change-username-input").val());
                $("#username-btn").html(localStorage.getItem('username'));
                $("#change-username-input").val("")
                $('#change-username-form').modal('hide');

               

                socket.emit('change_username', {
                    "connection": false,
                    "channel": localStorage.getItem('currentChannel'),
                    "new_username": localStorage.getItem('username'),
                    "old_username": old_username,
                    "date": date
                });

            } else {
                $("#change-username-input").val('')
                
                $(".change-user-exists-alert").css("display", "block");
            }
        }

        // Add data to send with request
        const data = new FormData();
        data.append('username', $("#change-username-input").val());

        // Send request
        request.send(data);
    }
});

   
    $("#emojionearea1").emojioneArea({
        tonesStyle: "bullet",
        events: {
            keyup: function (editor, e) {
                var code = e.which;
        if (code == 13) {
            date=get_date()
              message =this.getText();
              if($(".emojionearea-editor").html()=="")
       {return}
       else
       { $(".emojionearea-picker").addClass("hidden")
       $(".emojionearea-button").removeClass("active")
       $(".emojionearea-editor").html('')
       
        socket.emit('send_message', {
            "username": localStorage.getItem('username'),
            "text": message,
            "date": date,
            "channel": localStorage.getItem('currentChannel'),
            
        });
        
                      
        }//else
            }
        
        }
    }
            
    });

    $(".close1").on('click',function(){
        
        if($(".user-exists-alert").css("display", "block")){
            $(".user-exists-alert").css("display", "none");
            
        }
        if($(".change-user-exists-alert").css("display", "block")){
            $(".change-user-exists-alert").css("display", "none");
        }
        if($(".username-alert").css("display", "block")){
            $(".username-alert").css("display", "none");
            
        }
        if($(".change-username-alert").css("display", "block")){
            $(".change-username-alert").css("display", "none");
        }
       
    
    });

  
   
     //done
    $(".send-btn").on('click',function(){
        
        var date= get_date();
        
       message= $("#emojionearea1").val();
       if($(".emojionearea-editor").html()=="")
       {return}
       else
       { 
       $(".emojionearea-editor").html('')
       
        socket.emit('send_message', {
            "username": localStorage.getItem('username'),
            "text": message,
            "date": date,
            "channel": localStorage.getItem('currentChannel'),
            
        });
        
       }
        
    });

    $("#emojionearea1").keyup(function (e) {
        var code = e.which;
        if (code == 13) {
            this.source.val(this.getText());
            alert(this.source.val())
        }
    });

  

    $("#public-channel-input").keyup(function (e) {
        var code = e.which;
        if (code == 13) {
           
            if ($("#public-channel-input").val() == "") {
                return;
            }
           let channel= $("#public-channel-input").val()
           $("#public-channel-input").val("");
           socket.emit('add_channel',{
               'channel':channel
           });


        
        }});

    

   
    //adding new channel
    $('.add-public-channel').on('click',function(){
        if ($("#public-channel-input").val() == "") {
            return;
        }
       let channel= $("#public-channel-input").val()
       $("#public-channel-input").val("");
       socket.emit('add_channel',{
           'channel':channel
       });

    });
   //click on any channel
   $("#public-channels").on('click', 'h6', function (e) {
    if (!$(this).hasClass("channel-active")) {
        $("#typingUsersText").html('');
        $(".typingUsers").css("display", "none");
        $(".channel-active").removeClass("channel-active");
        $(this).addClass("channel-active");
        localStorage.setItem('currentChannel', $(this).html());

        let date = get_date();
        socket.emit('send_message', {
            "connection": true,
            "channel": localStorage.getItem("currentChannel"),
            "username": localStorage.getItem('username'),
            "date": date
        });

        if ($(".menu-btn").css("display") != "none") {
            $('.menu').toggleClass('menu_active');
            $('.content').toggleClass('content_active');
        }
    }

    
   // e.preventDefault();
});


    socket.on('connect',function(){
        var date= get_date();
        
        socket.emit('send message', {
            "connection": true,
            "channel": localStorage.getItem("currentChannel"),
            "username": localStorage.getItem('username'),
            "date": date
        });

        
          
        socket.emit('get all channels', 
        
        {"username": localStorage.getItem('username')});



    });

    socket.on('announce_message',function(msg){
       var m= document.getElementById("messages")
         
        if(msg['messages'])
        {   
            
            if(msg['messages'][0] && msg['messages'][0]['channel'] == localStorage.getItem('currentChannel'))
            {
                $("#messages").html("");
            }
             
            messages=msg['messages']
            messages.forEach(msg_ => {
                
            if(msg_['channel']==localStorage.getItem('currentChannel'))
              {   
                  //connected 1st time
                  text= autolinker.link(msg_['text']);
                if(msg_['connection']){
                      
                    $("#messages").append(`<div class="row msg-row justify-content-center"><div class="msg-connect">
                    <p><b>${msg_['username']}</b> ${text}<span class="message-date">${msg_['date']}</span></p></div></div>`)
                }
                else{
                   
                    
                    if (msg_['username'] == localStorage.getItem('username')) {
                        $("#messages").append(`<div class="row msg-row justify-content-end"><div class="message-wrapper">
                                            <p><b>${msg_['username']}</b></p>${text}</div></div>`);
                    } else {
                        
                        $("#messages").append(`<div class="row msg-row"><div class="message-wrapper msg-other">
                                            <p><b>${msg_['username']}</b></p>${text}</div></div>`);
                    }
                }

            }
            });

        } //for chat
        else {
            
           text= autolinker.link(msg['text']);
             
            if (msg['username'] == localStorage.getItem('username')) {
                $("#messages").append(`<div class="row msg-row justify-content-end"><div class="message-wrapper">
                                                <p><b>${msg['username']}</b><span class="message-date">${msg['date']}</span></p>${text}</div></div>`);
            } else {
                $("#messages").append(`<div class="row msg-row"><div class="message-wrapper msg-other">
                                                <p><b>${msg['username']}</b><span class="message-date">${msg['date']}</span></p>${text}</div></div>`);
            }

        }
        m.scrollTop= m.scrollHeight
    })

    socket.on('added_channel',function(msg){
     
       
        if (msg['message'] !== "general") {
            $("#public-channels").append(`<h6 class="channel">${msg['message']}</h6>`);
        }
     

    });

    socket.on('all_channels',function(channels){
         $("#public-channels").html(`<h6 class="channel">general</h6>`);

         channels['channels'].forEach(function (channel) {
                if (channel !== "general") {
                    $("#public-channels").append(`<h6 class="channel">${channel}</h6>`);
                }
          });

          $("h6").each(function () {
            if ($(this).html() == localStorage.getItem('currentChannel')) {
                $(this).addClass("channel-active");
            }
        });
    });

     socket.on('typing',function(msg){
        
        if(msg['channel']==localStorage.getItem('currentChannel')){
            if (msg['usernames'].length == 0 || msg['usernames'][0] == localStorage.getItem('username') && msg['usernames'].length == 1) {
                $("#typingUsersText").html('');
                $(".typingUsers").css("display", "none");
            } else 
            {
                $("#typingUsersText").html('');
                 
                msg['usernames'].forEach(function(username) {
                    if (username !== localStorage.getItem('username')) {
                        $("#typingUsersText").append(`${username}, `);
                    }
                });
     
                let temp = $("#typingUsersText").html().slice(0, -2);
                         
                 $("#typingUsersText").html(temp);
                 if (msg['usernames'].length == 1 || msg['usernames'].length == 2 && msg['usernames'].includes(localStorage.getItem('username')))
                 {
                     $("#typingUsersText").append(" is typing");
                 } else {
                     $("#typingUsersText").append(" are typing");
                 }
                 $(".typingUsers").css("display", "block");
             }
            
     
      }

         });

    //
    $('.menu-btn').on('click', function (e) {
        e.preventDefault();
        $('.menu').toggleClass('menu_active');
        $('.content').toggleClass('content_active');
    });
     //for displaying who is typing

     $('#message').bind('input propertychange', function () {
        
        socket.emit('type', {
            "status": "start",
            "channel": localStorage.getItem('currentChannel'),
            "username": localStorage.getItem('username')
        });

    });

   

    $("#emojionearea1").blur(function () {
        
        socket.emit('type', {
            "status": "end",
            "channel": localStorage.getItem('currentChannel'),
            "username": localStorage.getItem('username')
        });
    });
     
    

    
});
