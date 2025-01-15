//requires
const express = require('express');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const path = require('path');

//configuring express
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

//configuring mongoose
mongoose.connect('mongodb://localhost:27017/ellora')
const postSchema = mongoose.Schema({
		username: String,
		title: String,
		desc: String,
		time: Array,
		date: Array,
		replyCount: Number,
		replies: Array
})
const replySchema = mongoose.Schema({
		username: String,
		reply: String,
		time: String,
		date: String
})
const Post = mongoose.model( 'Post',postSchema );

//defining express routes

// Root route
app.get( '/', ( req,res ) => {
		res.render('home');
})

// Index route
app.get( '/posts', ( req,res ) => {
		Post.find()
		.then( newData => {
				data = newData.toReversed()
				res.render( 'index', { data } );
		})
})

// Create route
app.get( '/create', ( req,res ) => {
		res.render('post');
})
app.post( '/posts', ( req,res ) => {
		const { title, desc } = req.body;
		const [ time, date ] = moment();

		const post = new Post( {
				username: 'user',
				title: title,
				desc: desc,
				time: time,
				date: date,
				replyCount: 0,
				replies: []
		});

		res.redirect( '/posts' );
		post.save()
})

// Show route
app.get( '/posts/:id',( req,res ) => {
		const { id } = req.params;
		Post.findById(id)
		.then( data => {
				res.render( 'show', { data } )
		})
})

// Update route
app.get( '/posts/:id/edit',( req,res ) => {
		const { id } = req.params;
		Post.findById(id)
		.then( data => {
				res.render( 'edit', { data } )
		})
})
app.patch( '/posts/:id',( req,res ) => {
		const { id } = req.params;
		const { title,desc } = req.body;
		Post.findById(id)
		.then( data => {
				data.title = title;
				data.desc = desc;
				data.save();
		})
		res.redirect('/posts');
})

// Delete route
app.delete( '/posts/:id',( req,res ) => {
		const { id } = req.params;
		Post.deleteOne({ _id: id })
		.then( resp => {
				res.redirect('/posts');
		})
})

// Replies functionality
app.get( '/posts/:id/reply',( req,res ) => {
		const { id } = req.params;
		Post.findById(id)
		.then( data => {
				res.render( 'reply',{ data } )
		})
})
app.post( '/posts/:id/reply',( req,res ) => {
		const { id } = req.params;
		const { userReply } = req.body;
		const [ time,date ] = moment();
		const reply = { 
				username: "testUser",
				reply: userReply,
				time: time,
				date: date
		}

		Post.findById(id)
		.then( data => {
				data.replies.unshift( reply );
				data.replyCount++;
				res.redirect( `/posts/${id}/reply` );
				data.save()
		})
})

//Express App listen port
app.listen( 8000, () => {
		console.log( "Connection Requested" );
})

//Custom Functions
function moment(){
		const d = new Date();
		date = d.toDateString();
		time = d.toLocaleTimeString().split(" ");
		date = [date.split(' ').slice(1,-1).join(" "),date.split(' ').slice(-1).join(" ")];
		return [time, date];
}
