$(document).ready(function () {

	$('.commentform').submit(function (e) {
	console.log('commentform');
		e.preventDefault()
		console.log($(this));
		$this = $(this)
		var item = $this.attr('item')
		var rep = $this.attr('reponse')
		var itemid = $this.attr('itemid')
		var name = $this.find('input[name="name"]').val()
		var email = $this.find('input[name="email"]').val()
		var message = $this.find('textarea[name="message"]').val()
		console.log(name);
		console.log(email);
		console.log(message);
		console.log(item);
		console.log(itemid);
		var postData = $this.serialize();


		console.log(postData);
		if(item == 'project')
		{
			if(rep){

			}else{

				$.ajax(
			    {
			        url : '/project/'+itemid+'/addComment',
			        type: "POST",
			        data : postData,
			        success:function(data, textStatus, jqXHR) 
			        {
			        	$this.find('.errorMessageRequired').hide()
			        	$this.find('.errorMessageError').hide()
			        	console.log('DATA',data);
			            $this.find('.cache').fadeIn()
			            console.log($this.parent());
			            setTimeout(function (argument) {
				            $this.parent().collapse('hide');
			            },2000)
			        },
			        error: function(jqXHR, textStatus, errorThrown) 
			        {
			            //if fails    
			            console.log('errorThrown');  
			            console.log(errorThrown);  
			            console.log(textStatus);  
			            console.log(JSON.parse(jqXHR.responseText).error);  
			            if(JSON.parse(jqXHR.responseText).error=="E_VALIDATION"){
			            	$this.find('.errorMessageRequired').fadeIn()
			            }else{
			            	$this.find('.errorMessageError').fadeIn()
			            }
			        }
			    });

			}
		}
		if(item == 'comment')
		{
			if(rep){

			}else{

				$.ajax(
			    {
			        url : '/project/addReponse/'+itemid,
			        type: "POST",
			        data : postData,
			        success:function(data, textStatus, jqXHR) 
			        {
			        	$this.find('.errorMessageRequired').hide()
			        	$this.find('.errorMessageError').hide()
			        	console.log('DATA',data);
			            $this.find('.cache').fadeIn()
			            console.log($this.parent());
			            setTimeout(function (argument) {
				            $this.parent().collapse('hide');
			            },2000)
			        },
			        error: function(jqXHR, textStatus, errorThrown) 
			        {
			            //if fails    
			            console.log('errorThrown');  
			            console.log(errorThrown);  
			            console.log(textStatus);  
			            console.log(JSON.parse(jqXHR.responseText).error);  
			            if(JSON.parse(jqXHR.responseText).error=="E_VALIDATION"){
			            	$this.find('.errorMessageRequired').fadeIn()
			            }else{
			            	$this.find('.errorMessageError').fadeIn()
			            }
			        }
			    });

			}
		}
	})
})
