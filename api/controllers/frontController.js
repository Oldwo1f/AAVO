var Promise = require('bluebird');
var nodemailer = require('nodemailer');
var moment = require('moment');

module.exports={
	home:function(req,res,next) {

		console.log('home');
		
		Article.find({status:'actif'}).populate('translations').populate('images').sort('createdAt DESC').limit(3).exec(function (err,articles) {
			// body...
			console.log(err);
			console.log(articles);
			console.log(req.locale);
			// if(req.locale!= 'fr')
			// {
				return Promise.map(articles,function  (article) {
					console.log('---------------------------');
					return new Promise(function(resolve,rej){
						if(article.translations.length && req.locale!= 'fr'){
							console.log('we got Trad');
							_.map(article.translations,function  (trad) {
								console.log('---------------------------');
								if(trad.lang == req.locale){
									article.title = (trad.title) ? trad.title : article.title;
									article.content = (trad.content) ? trad.content : article.content;
									article.rewriteurl = (trad.rewriteurl) ? trad.rewriteurl : article.rewriteurl;
									article.keyword = (trad.keyword) ? trad.keyword : article.keyword;
									article.description = (trad.description) ? trad.description : article.description;
								}
							})
						}
						article.content = article.content.substring(0,200) + '...'
						if(article.images.length)
						{
							var img0 = _.find(article.images, function(chr) {
							  return chr.rank == 0;
							})
							Image.findOne(img0.image).exec(function (err,datas) {
								console.log('datas',datas);
								article.img = datas

								resolve(article)
							})
						}else
						{
							resolve(article)
						}
					})
					
				}).then(function (articless) {
					console.log(articless);
					res.status(200).view('homepage',{
						articles:articles,
						title: req.__('SEO_HOME_title'),
						keyword: req.__('SEO_HOME_keyword'),
						description:req.__('SEO_HOME_description'),
						scripturl:'script.js',
						menu:'home',
					})
				})
			// }
			
		})




	},	
	portfolio:function(req,res,next) {

		console.log('portfolio');
		async.parallel({
			projs:function  (cb) {
				Project.find({status:'actif'}).populateAll().sort('createdAt DESC').exec(function (err,projects) {
			
						return Promise.map(projects,function  (project) {
							// console.log('---------------------------');
							return new Promise(function(resolve,rej){
								if(project.translations.length && req.locale!= 'fr'){
									// console.log('we got Trad');
									_.map(project.translations,function  (trad) {
										// console.log('---------------------------');
										if(trad.lang == req.locale){
											project.title = (trad.title) ? trad.title : project.title;
											project.content = (trad.content) ? trad.content : project.content;
											project.rewriteurl = (trad.rewriteurl) ? trad.rewriteurl : project.rewriteurl;
											project.keyword = (trad.keyword) ? trad.keyword : project.keyword;
											project.description = (trad.description) ? trad.description : project.description;
										}
									})
								}
								project.content = project.content.substring(0,200) + '...'
								if(project.images.length)
								{
									var img0 = _.find(project.images, function(chr) {
									  return chr.rank == 0;
									})
									Image.findOne(img0.image).exec(function (err,datas) {
										// console.log('datas',datas);
										project.img = datas

										resolve(project)
									})
								}else
								{
									resolve(project)
								}
							})
							
						}).then(function (projectss) {
							// console.log(projectss);
							cb(null,projects)
						})
					
				})
			},
			cats:function  (cb) {
				CategoryProject.find().populateAll().sort('name DESC').exec(function (err,cats) {
			console.log(err);
			console.log(cats);
			 _.remove(cats,function (n) {
				return n.nbProjects <=0;
			})
						return Promise.map(cats,function  (cat) {
							console.log('---------------------------');
							return new Promise(function(resolve,rej){
								console.log(cat.translations.length);
								if(cat.translations.length && req.locale!= 'fr'){
									console.log('we got Trad');
									_.map(cat.translations,function  (trad) {
										console.log('---------------------------');
										if(trad.lang == req.locale){
											console.log('local cool');
											cat.name = (trad.name) ? trad.name : cat.name;
											// project.content = (trad.content) ? trad.content : project.content;
											// project.rewriteurl = (trad.rewriteurl) ? trad.rewriteurl : project.rewriteurl;
											// project.keyword = (trad.keyword) ? trad.keyword : project.keyword;
											// project.description = (trad.description) ? trad.description : project.description;
										}
									})

									resolve(cat)
								}else
								{
									resolve(cat)
								}
							})
							
						}).then(function (projectss) {
							cb(null,cats)
						})
					
				})
			}
		},function  (err,results) {
			console.log(err);
			console.log('results');
			console.log(results.cats);
			// console.log(results);
			res.status(200).view('portfolio',{
				'projects':results.projs,
				'categories':results.cats,
				title: req.__('SEO_PORTFO_title'),
				keyword: req.__('SEO_PORTFO_keyword'),
				description:req.__('SEO_PORTFO_description'),
				scripturl:'portfo.js',
				menu:'portfo'
			})
		})
		




	},
	projet:function(req,res,next) {
		console.log(req.locale);
		req.locale = req.locale || 'en'
		moment.locale(req.locale)
		console.log("FETCH ONE project");
		
				Project.find(req.params.id).populateAll().exec(function (err,items){
					
						if(err)
							callback(err)

						// callback(null,items)
						if(items.length>0)
						{
								items[0].nbView= Number(items[0].nbView) + 1;
								items[0].save();
								var project= items[0];
								// console.log('item',item);
								async.series({
								image:function(cbparalelle) {
									async.map(project.images,
									function(item1,cb1) {
										// console.log('item1',item1);
										Image.findOne(item1.image).exec(function(err,data) {
											item1.image=data
											cb1(null,item1)
										})

									},function(err, results) {
										// console.log('results',results);
										cbparalelle(null,results)
									})
								},
								document:function(cbparalelle) {
									async.map(project.documents,
									function(item1,cb1) {
										// console.log('item1',item1);
										Document.findOne(item1.document).exec(function(err,data) {
											item1.document=data
											cb1(null,item1)
										})

									},function(err, results) {
										// console.log('results',results);
										cbparalelle(null,results)
									})
								},
								translations:function(cbparalelle) {
									async.map(project.translations,
									function(trad,cb1) {
										console.log(trad);
										if(trad.lang == req.locale){
											console.log('locale');
											project.title = (trad.title) ? trad.title : project.title;
											project.content = (trad.content) ? trad.content : project.content;
											project.rewriteurl = (trad.rewriteurl) ? trad.rewriteurl : project.rewriteurl;
											project.keyword = (trad.keyword) ? trad.keyword : project.keyword;
											project.description = (trad.description) ? trad.description : project.description;
										}
										cb1(null,project)

									},function(err, results) {
										// console.log('results',results);
										cbparalelle(null,results)
									})
								},
								comment:function(cbparalelle) {
											console.log('------------------------------');
											// console.log(project.comments);
											_.remove(project.comments,function (n) {
												return n.status != 'success'
											})
											var allcomments = [];
										// _.sortBy(project.comments,function (n) {
										// 	return new Date(n.createdAt)
										// })
											project.comments = project.comments.reverse()

									async.mapSeries(project.comments,
									function(item1,cb1) {
										// console.log('item1',item1);
										Comment.find(item1.id).populate('reponses',{ where:{status:'success'}}).exec(function(err,data) {
											// item1.comment=data
											// console.log(data);
											console.log('------------------------------');
											// console.log(project.comments.indexOf(item1));
											// item1=data
											// project.comments.splice(project.comments.indexOf(item1),1,data[0])
											allcomments.push(data[0])
											// console.log(data);
											cb1(null,item1)
										})

									},function(err, results) {
										
										project.comments=allcomments;
										// console.log('allcomments',allcomments);
										cbparalelle(null,allcomments)
									})
								}},function(err,ress) {

 										console.log('DELETE');
									if(project.category)
										project.category=project.category.id;
									if(project.author)
										project.author=project.author.id;

									var projecttogo = _.clone(project)

									delete projecttogo.comments
									projecttogo.comments=ress.comment
									// console.log(projecttogo.comments);
									// console.log(projecttogo);
									console.log('Final Data');
									// console.log('fetch ONE Project', projecttogo);
									// res.status(200).send(projecttogo)
									res.status(200).view('project',{
										'project':projecttogo,
										moment: moment,
										'title': projecttogo.title +' - AAVO',
										keyword: projecttogo.keyword,
										description:projecttogo.description,
										scripturl:'project.js',
										menu:'portfo'
									})
								})
								
							}
							
								
								// callback(null,items);

	
						
				});
		
		   
	},
	addCommentProj:function(req,res,next) {

		console.log('addCommentProj');
		console.log(req.params.itemid);
		

		Project.findOne(req.params.itemid).exec(function (err,article) {
			console.log(article);
			Comment.create({author:req.body.name,
	  		email:req.body.email,
	  		content:req.body.message,
	  		status:'new',
	  		project:req.params.itemid
	  		}).exec(function (err,coment){
									console.log(err)
				if(err)
					res.status(400).send(err)
				else{

				Notification.create({type:'projectcomment',status:'todo',info1:article.title,info2:'par '+coment.author,item:'project',itemid:req.params.itemid}).exec(function (err,notif){
						console.log(err)
						console.log(notif)
						 // Notification.publishCreate(notif);
			    		// res.status(200).send(created);
			    	res.status(200).send(coment)
				});
				}
			});
		})
		
		

	},
	addReponseProj:function(req,res,next) {

		console.log('addCommentProj');
		console.log(req.params.itemid);
		

		Comment.findOne(req.params.itemid).exec(function (err,article) {
			console.log(article);
			Reponse.create({author:req.body.name,
	  		email:req.body.email,
	  		content:req.body.message,
	  		status:'new',
	  		comment:req.params.itemid
	  		}).exec(function (err,coment){
									console.log(err)
				if(err)
					res.status(400).send(err)
				else{

				Notification.create({type:'projectcomment',status:'todo',info1:article.title,info2:'par '+coment.author,item:'project',itemid:req.params.itemid}).exec(function (err,notif){
						console.log(err)
						console.log(notif)
						 // Notification.publishCreate(notif);
			    		// res.status(200).send(created);
			    	res.status(200).send(coment)
				});
				}
			});
		})
		
		

	},
	blog:function(req,res,next) {

		console.log('blog');
		async.parallel({
			projs:function  (cb) {
				Article.find({status:'actif'}).populateAll().sort('createdAt DESC').limit(20).exec(function (err,projects) {
			
						return Promise.map(projects,function  (project) {
							// console.log('---------------------------');
							return new Promise(function(resolve,rej){
								if(project.translations.length && req.locale!= 'fr'){
									// console.log('we got Trad');
									_.map(project.translations,function  (trad) {
										// console.log('---------------------------');
										if(trad.lang == req.locale){
											project.title = (trad.title) ? trad.title : project.title;
											project.content = (trad.content) ? trad.content : project.content;
											project.rewriteurl = (trad.rewriteurl) ? trad.rewriteurl : project.rewriteurl;
											project.keyword = (trad.keyword) ? trad.keyword : project.keyword;
											project.description = (trad.description) ? trad.description : project.description;
										}
									})
								}
								project.content = project.content.substring(0,500) + '...'
								if(project.images.length)
								{
									var img0 = _.find(project.images, function(chr) {
									  return chr.rank == 0;
									})
									Image.findOne(img0.image).exec(function (err,datas) {
										// console.log('datas',datas);
										project.img = datas

										resolve(project)
									})
								}else
								{
									resolve(project)
								}
							})
							
						}).then(function (projectss) {
							// console.log(projectss);
							cb(null,projects)
						})
					
				})
			},
			cats:function  (cb) {
				CategoryBlog.find().populateAll().sort('name DESC').exec(function (err,cats) {
			console.log(err);
			console.log(cats);
			 _.remove(cats,function (n) {
				return n.nbArticles <=0;
			})
						return Promise.map(cats,function  (cat) {
							console.log('---------------------------');
							return new Promise(function(resolve,rej){
								console.log(cat.translations.length);
								if(cat.translations.length && req.locale!= 'fr'){
									console.log('we got Trad');
									_.map(cat.translations,function  (trad) {
										console.log('---------------------------');
										if(trad.lang == req.locale){
											console.log('local cool');
											cat.name = (trad.name) ? trad.name : cat.name;
											// project.content = (trad.content) ? trad.content : project.content;
											// project.rewriteurl = (trad.rewriteurl) ? trad.rewriteurl : project.rewriteurl;
											// project.keyword = (trad.keyword) ? trad.keyword : project.keyword;
											// project.description = (trad.description) ? trad.description : project.description;
										}
									})

									resolve(cat)
								}else
								{
									resolve(cat)
								}
							})
							
						}).then(function (projectss) {
							cb(null,cats)
						})
					
				})
			}
		},function  (err,results) {
			console.log(err);
			console.log('results');
			console.log(results.cats);
			// console.log(results);
			res.status(200).view('blog',{
				'articles':results.projs,
				'categories':results.cats,
				title: req.__('SEO_BLOG_title'),
				keyword: req.__('SEO_BLOG_keyword'),
				description:req.__('SEO_BLOG_description'),
				scripturl:'article.js',
				menu:'blog'
			})
		})
		




	},
	article:function(req,res,next) {
		console.log(req.locale);
		req.locale = req.locale || 'en'
		moment.locale(req.locale)
		console.log("FETCH ONE project");
		
				Article.find(req.params.id).populateAll().exec(function (err,items){
						

						
						if(err)
							callback(err)

						// callback(null,items)
						if(items.length>0)
						{
								items[0].nbView= Number(items[0].nbView) + 1;
								items[0].save();
								var project= items[0];
								// console.log('item',item);
								async.series({
								image:function(cbparalelle) {
									async.map(project.images,
									function(item1,cb1) {
										// console.log('item1',item1);
										Image.findOne(item1.image).exec(function(err,data) {
											item1.image=data
											cb1(null,item1)
										})

									},function(err, results) {
										// console.log('results',results);
										cbparalelle(null,results)
									})
								},
								document:function(cbparalelle) {
									async.map(project.documents,
									function(item1,cb1) {
										// console.log('item1',item1);
										Document.findOne(item1.document).exec(function(err,data) {
											item1.document=data
											cb1(null,item1)
										})

									},function(err, results) {
										// console.log('results',results);
										cbparalelle(null,results)
									})
								},
								translations:function(cbparalelle) {
									async.map(project.translations,
									function(trad,cb1) {
										console.log(trad);
										if(trad.lang == req.locale){
											console.log('locale');
											project.title = (trad.title) ? trad.title : project.title;
											project.content = (trad.content) ? trad.content : project.content;
											project.rewriteurl = (trad.rewriteurl) ? trad.rewriteurl : project.rewriteurl;
											project.keyword = (trad.keyword) ? trad.keyword : project.keyword;
											project.description = (trad.description) ? trad.description : project.description;
										}
										cb1(null,project)

									},function(err, results) {
										// console.log('results',results);
										cbparalelle(null,results)
									})
								},
								comment:function(cbparalelle) {
											console.log('------------------------------');
											// console.log(project.comments);
											_.remove(project.comments,function (n) {
												return n.status != 'success'
											})
											var allcomments = [];
										// _.sortBy(project.comments,function (n) {
										// 	return new Date(n.createdAt)
										// })
											project.comments = project.comments.reverse()

									async.mapSeries(project.comments,
									function(item1,cb1) {
										// console.log('item1',item1);
										Comment.find(item1.id).populate('reponses',{ where:{status:'success'}}).exec(function(err,data) {
											// item1.comment=data
											// console.log(data);
											console.log('------------------------------');
											// console.log(project.comments.indexOf(item1));
											// item1=data
											// project.comments.splice(project.comments.indexOf(item1),1,data[0])
											allcomments.push(data[0])
											// console.log(data);
											cb1(null,item1)
										})

									},function(err, results) {
										
										project.comments=allcomments;
										// console.log('allcomments',allcomments);
										cbparalelle(null,allcomments)
									})
								}
							},function(err,ress) {

 										console.log('DELETE');
									if(project.category)
										project.category=project.category.id;
									

									var projecttogo = _.clone(project)

									delete projecttogo.comments
									projecttogo.comments=ress.comment
									// console.log(projecttogo.comments);
									// console.log(projecttogo);
									console.log('Final Data');
									// console.log('fetch ONE Project', projecttogo);
									// res.status(200).send(projecttogo)
									res.status(200).view('article',{
										'article':projecttogo,
										moment: moment,
										'title': projecttogo.title +' - BLOG - AAVO',
										keyword: projecttogo.keyword,
										description:projecttogo.description,
										scripturl:'article.js',
										menu:'blog'
									})
								})
								
							}
							
								
								// callback(null,items);

	
						
				});
		
		   
	},
	addCommentArticle:function(req,res,next) {

		console.log('addCommentProj');
		console.log(req.params.itemid);
		

		Article.findOne(req.params.itemid).exec(function (err,article) {
			console.log(article);
			Comment.create({author:req.body.name,
	  		email:req.body.email,
	  		content:req.body.message,
	  		status:'new',
	  		article:req.params.itemid
	  		}).exec(function (err,coment){
									console.log(err)
				if(err)
					res.status(400).send(err)
				else{

				Notification.create({type:'articlecomment',status:'todo',info1:article.title,info2:'par '+coment.author,item:'article',itemid:req.params.itemid}).exec(function (err,notif){
						console.log(err)
						console.log(notif)
						 // Notification.publishCreate(notif);
			    		// res.status(200).send(created);
			    	res.status(200).send(coment)
				});
				}
			});
		})
		
		

	},
	addReponseArticle:function(req,res,next) {

		console.log('addCommentProj');
		console.log(req.params.itemid);
		

		Comment.findOne(req.params.itemid).exec(function (err,article) {
			console.log(article);
			Reponse.create({author:req.body.name,
	  		email:req.body.email,
	  		content:req.body.message,
	  		status:'new',
	  		comment:req.params.itemid
	  		}).exec(function (err,coment){
									console.log(err)
				if(err)
					res.status(400).send(err)
				else{

				Notification.create({type:'articlecomment',status:'todo',info1:article.title,info2:'par '+coment.author,item:'article',itemid:req.params.itemid}).exec(function (err,notif){
						console.log(err)
						console.log(notif)
						 // Notification.publishCreate(notif);
			    		// res.status(200).send(created);
			    	res.status(200).send(coment)
				});
				}
			});
		})
		
		

	},
	test:function(req,res,next) {

		console.log('test');
// User.subscribe( req.socket,[],['create'] );
		res.render('test')
	}
	
}
