const mongoose = require('mongoose');
const config = require('../config/database');

const InviteSchema = mongoose.Schema({
	sendTo:{
		type: String,
		required: true
	},
	sendBy: {
		type: String,
		required: true
	},
	timeSent: {
		type: String,
		required: true
	} 
});


const Invite = module.exports = mongoose.model('Invite', InviteSchema);

module.exports.saveInvite = function(invite, callback) {
	invite.save()
	.then(result => {
		return callback({success:true, result:result });
	})
	.catch(err => {
		return callback({success:false, msg: err});
	})
}

module.exports.getAllInvites = function(authName, callback) {
	var query = {sendTo: authName};
	Invite.find(query).exec()
		.then(docs => {
			return callback({err: false, data: docs});
		})
		.catch(err => {	
			return callback({err: true, msg: "Error in Mongo"});
		})
}
