const userData = require('./model');
const mongoose = require('mongoose');
const _ = require('lodash')
var generator = require('generate-password');
const bcrypt = require('bcryptjs');
var mail = require('../../utils/mailService');
const {ObjectId} = require('mongodb');
const jwt = require('jsonwebtoken');
const config = require('../../../config')
// const bcrypt = require('bcryptjs');

// Helper: generate setup token
function generatePasswordSetupToken(userId, email) {
    return jwt.sign({
        type: 'password_setup',
        userId: String(userId),
        email
    }, config.SECRET, { expiresIn: '24h' });
}

// Helper: build setup link
function buildPasswordSetupLink(token) {
    return `${config.FRONTEND_USER_URL}/set-password?token=${encodeURIComponent(token)}`;
}

// Helper: send setup email
async function sendPasswordSetupEmail(toEmail, setupLink, mode) {
    const isWelcome = mode === 'welcome';
    const subject = isWelcome ? 'Welcome - Set Your Password' : 'Password Setup Request';
    const intro = isWelcome
        ? 'Welcome to our platform! Your account has been created successfully.'
        : 'You have requested to set up your password.';

	// Build HTML and plain-text versions
	const htmlBody = `
		<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f9fafb;padding:24px 0;">
			<tr>
				<td>
					<table role="presentation" cellpadding="0" cellspacing="0" width="600" align="center" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;font-family:Arial, Helvetica, sans-serif;color:#111827;">
						<tr>
							<td style="padding:20px 24px;background:#111827;border-top-left-radius:8px;border-top-right-radius:8px;">
								<img src="https://www.elliotsystems.com/wp-content/uploads/2021/08/Elliot-white-font.png" alt="Elliot Systems" height="28" style="display:block;" />
							</td>
						</tr>
						<tr>
							<td style="padding:24px;">
								<h2 style="margin:0 0 12px 0;font-weight:600;font-size:20px;">Dear Customer,</h2>
								<p style="margin:0 0 16px 0;line-height:1.6;">${intro}</p>
								<p style="margin:0 0 16px 0;line-height:1.6;">Please set your password by clicking the button below:</p>
								<p style="margin:0 0 20px 0;">
									<a href="${setupLink}" style="background-color:#2563eb;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:6px;display:inline-block;font-weight:600;">Set Password</a>
								</p>
								<p style="margin:0 0 16px 0;line-height:1.6;">If the button doesn't work, click this link: <a href="${setupLink}" style="color:#2563eb;">Set Password link</a></p>
								<p style="margin:0 0 16px 0;line-height:1.6;">This link will expire in 24 hours.</p>
								${isWelcome ? `<p style="margin:0 0 16px 0;line-height:1.6;">Your username: <strong>${toEmail}</strong></p>` : ''}
								<p style="margin:24px 0 8px 0;">Assuring you of our best service at all times.</p>
								<p style="margin:0 0 24px 0;">Warm Regards,<br/>Customer Service</p>
							</td>
						</tr>
						<tr>
							<td style="padding:16px 24px;background:#f3f4f6;border-top:1px solid #e5e7eb;">
								<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
									<tr>
										<td style="font-size:13px;color:#374151;line-height:1.6;">
											<strong>Contact Info</strong><br/>
											Email: <a href="mailto:info@elliotsystems.com" style="color:#2563eb;text-decoration:none;">info@elliotsystems.com</a><br/>
											Address: 15500 Voss Road, Suite 401, Sugar Land, TX, 77498<br/>
											Phone (US): +1 281-891-3766<br/>
											Phone (IN): +91-9881 0788 54
										</td>
										<td align="right" style="font-size:13px;">
											<a href="https://www.linkedin.com/company/elliotsystems" style="color:#2563eb;text-decoration:none;font-weight:600;">Follow us on LinkedIn</a>
										</td>
									</tr>
								</table>
							</td>
						</tr>
						<tr>
							<td style="padding:12px 24px;">
								<hr style="border:none;border-top:1px solid #e5e7eb;margin:0;"/>
								<p style="font-size:12px;color:#6b7280;line-height:1.6;margin:12px 0 0 0;">This is a system generated notification. Replies to this message will not be answered. This e-mail is confidential and may also be privileged. If you are not the intended recipient, please notify us immediately; you should not copy or use it for any purpose, nor disclose its contents to any other person.</p>
							</td>
						</tr>
					</table>
				</td>
			</tr>
		</table>`;

	const textBody = `Dear Customer,\n\n${intro}\n\nPlease set your password using the link below:\n${setupLink}\n\nThis link will expire in 24 hours.\n\n${isWelcome ? 'Your username: ' + toEmail + '\n\n' : ''}Assuring you of our best service at all times.\n\nWarm Regards,\nCustomer Service\n\n***************************************\nThis is a system generated notification. Replies to this message will not be answered.\nThis e-mail is confidential and may also be privileged. If you are not the intended recipient, please notify us immediately; you should not copy or use it for any purpose, nor disclose its contents to any other person\n***************************************`;

	return mail('gmail',
		'notification@elliotsystems.com',
		htmlBody,
		toEmail,
		subject,
		'rfqh lwfy pvxa wbiv',
		textBody,
		'',
		'',
		''
	);
}

async function insertOEMUser(req){
    try{
       
        let existUser = await userData.find({$and: [{email_id : req.body.email_id }]});
        if(existUser.length){
            return {
                msg : "User already exist"
            }
        }else {
           // Initialize password setup state (JWT will be sent instead of storing token)
           req.body.passwordSetupToken = null;
           req.body.passwordSetupExpires = null;
           req.body.isPasswordSet = false;
           // Don't set password initially
           delete req.body.password;
           
           const user = new userData(req.body);
           const insertedUser = await user.save();
           
           // Generate token and send email via helper
           const token = generatePasswordSetupToken(insertedUser._id, insertedUser.email_id);
           const setupLink = buildPasswordSetupLink(token);
           await sendPasswordSetupEmail(insertedUser.email_id, setupLink, 'welcome')
                
           return {
               msg: 'User created successfully. Password setup link sent to email.',
                id: insertedUser.id
           }
        }
    }catch(error){
        // console.log("error in",error);
        return Promise.reject(error);
    }
}

async function getOEMUser(req){
    // console.log('get subject hitt',req.query);
    try{
            // console.log(req.query)
            const searchText = req.query.search || '';
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const limit = Math.max(1, parseInt(req.query.limit) || 10);
            const skip = (page - 1) * limit;
            const order = req.query.order ? Number(req.query.order) : -1;
            const sort = req.query.sort || 'registeredOn';
            const sortObj = { [sort]: order };;
            const MapCompanyId = req.query.mapCompanyId ? ObjectId(req.query.mapCompanyId) : ''
            // const type = req.query.type ? req.query.type : "";
            const fromDate = req.query.fromDate ? Number(req.query.fromDate) : "";
            const toDate = req.query.toDate ? Number(req.query.toDate) : "";
            let query = {
            '$match': {
                'company_id': Number(req.query.companyId),
                "isDelete" : false,
                "administrator" : false,
                //  "MapCompanyId": { $regex: MapCompanyId, $options: 'i' },
                '$or': [
                { "first_name": { $regex: searchText, $options: 'i' } },
                { "last_name": {$regex: searchText, $options: 'i' } }
                ]
                // "first_name": { $regex: searchText, $options: 'i' },
                // "last_name": { $regex: searchText, $options: 'i' },
               
            },
        }
        if(MapCompanyId){
        query.$match.MapCompanyId = MapCompanyId
        }
        if(fromDate && toDate){
            query.$match.registeredOn =   { '$gte': fromDate, '$lte': toDate }
        }
        const getAllUsers = await userData.aggregate([  query,
         {"$sort" :sortObj},
           { '$lookup': { 
            'from': 'companies',
            'localField': 'MapCompanyId',
            'foreignField': '_id',
            'as': 'compnayDetails' 
        } },
         {"$project" : {
            address : 1,
            first_name:1,
            last_name:1,
            email_id:1, 
            email_id2: 1,  
            "compnayDetails.companyName" :1 ,    
            // company_name:"$compnayDetails.companyName",
            phone_number:1,
            dial_code : 1,
            registeredOn:1,
            MapCompanyId:1


         }},
          { $unwind: "$compnayDetails" },
         {
                    $facet: {
                        data: [
                            { $skip: skip },
                            { $limit: limit }
                        ],
                        totalCount: [
                            { $count: "count" }
                        ]
                    }
                }
        ]);  
        // console.log(getAllUsers)      
        return {
            msg: 'successfully Find',
            // data: getAllUsers
              data: getAllUsers.length > 0 ? getAllUsers[0].data.length ? getAllUsers[0].data : []:[],
            total: getAllUsers.length > 0 ? getAllUsers[0].totalCount.length > 0 ? getAllUsers[0].totalCount[0].count : 0 : 0
        }
    }catch (error){
        // console.log('error occure in get lcd Config',error);
        return Promise.reject('error occure in get lcd Config')
    }
}

// getUserNotification
async function getUserById(req){
    // console.log('get subject hitt',req);
    try{
        const getAllUsers = await userData.aggregate([  {
            '$match': {
                _id : ObjectId(req.params.id),
                "isDelete" : false,
                // "administrator" : false
               
            },
        },
         {"$sort" :{"registeredOn" : 1}},
        { '$lookup': { 
            'from': 'companies',
            'localField': 'MapCompanyId',
            'foreignField': '_id',
            'as': 'compnayDetails' 
        } },
         {"$project" : {
            address : 1,
            first_name:1,
            last_name:1,
            email_id:1, 
            dial_code : 1,
            // email_id2: 1,           
            company_name:1,
            phone_number:1,
            registeredOn:1,
            emailNotifications :1,
            smslNotifications : 1,
            "compnayDetails.companyName" :1 ,  
            MapCompanyId:1


         }},
        // { $unwind: "$compnayDetails" }
          {
    $unwind: {
      path: "$compnayDetails",
      preserveNullAndEmptyArrays: true
    }
  }
        ]);  
        // console.log(getAllUsers)      
        return {
            msg: 'successfully Find',
            data: getAllUsers
        }
    }catch (error){
        // console.log('error occure in get lcd Config',error);
        return Promise.reject('error occure in get lcd Config')
    }
}

// getUserByCompanyId
async function getUserByCompanyId(req){
    // console.log('get subject hitt',req);
    try{
        const getAllUsersByCompany = await userData.aggregate([  {
            '$match': {
                "MapCompanyId" : ObjectId(req.params.id),
                "isDelete" : false,
                // "administrator" : false
               
            },
        },
        //  {"$sort" :{"registeredOn" : 1}},
        // { '$lookup': { 
        //     'from': 'companies',
        //     'localField': 'MapCompanyId',
        //     'foreignField': '_id',
        //     'as': 'compnayDetails' 
        // } },
         {"$project" : {
            // address : 1,
            first_name:1,
            last_name:1,
            // email_id:1, 
            // email_id2: 1,           
            // company_name:1,
            // phone_number:1,
            // registeredOn:1,
            // emailNotifications :1,
            // smslNotifications : 1,
            // "compnayDetails.companyName" :1 ,  
            // MapCompanyId:1


         }},
        // { $unwind: "$compnayDetails" }
        ]);  
        // console.log(getAllUsers)      
        return {
            msg: 'successfully Find',
            data: getAllUsersByCompany
        }
    }catch (error){
        // console.log('error occure in get lcd Config',error);
        return Promise.reject('error occure in get lcd Config')
    }
}

// getOEMDeiceByuser
async function getOEMDeiceByuser(req){
    // console.log('get subject hitt',req);
    try{
        const User = await userData.aggregate([  {
            '$match': {
               _id : ObjectId(req.params.id),               
            },
        },
         {"$sort" :{"registeredOn" : 1}},
        //  {"$project" : {
        //     // address : 1,
        //     first_name:1,
        //     last_name:1,
        //     email_id:1, 
        //     // email_id2: 1,           
        //     // company_name:1,
        //     // phone_number:1,
        //     // registeredOn:1
        //  }},
         { '$lookup': { 
            'from': 'companyAssets',
            'localField': '_id',
            'foreignField': 'MapCustomer',
            'as': 'assetDetails' 
        } },
          {
                    $unwind:"$assetDetails"
        }, 
        { '$lookup': { 
            'from': 'assetTypes',
            'localField': 'assetDetails.AssetTypeId',
            'foreignField': 'AssetTypeId',
            'as': 'assetDetails.assetTypeDetails' 
        } },
        {"$project" : {
            first_name:1,
            last_name:1,
            email_id:1, 
            "assetDetails._id" : 1,
            "assetDetails.AssetId" : 1,
            "assetDetails.AssetName" : 1,
            "assetDetails.AssetType" : 1,
            "assetDetails.Topic" : 1,
            "assetDetails.AssetTypeId" : 1,
            "assetDetails.Gateway" : 1,
            "assetDetails.InstallationDate":1,
            "assetDetails.status":1,
           "assetDetails.ManufacturingId":1,
           "assetDetails.timeZone":1,
           "assetDetails.SlaveId":1,
           "assetDetails.assetTypeDetails.Name":1,
        //    assetDetails.assetTypeDetails.AssetTypeId:1
            
            
         }},
         {$group: {
            _id: "$_id",
            first_name: { $first: "$first_name" },
            last_name: { $first: "$last_name" },
            email_id: { $first: "$email_id" },
            assetDetails: { $push: "$assetDetails" }
        }}
        ]);
    
        return {
            msg: 'successfully Find',
            data: User
        }
    }catch (error){
        // console.log('error occure in get lcd Config',error);
        return Promise.reject('error occure in get lcd Config')
    }
}

// getAssetTypeByuser
async function getAssetTypeByuser(req){
    // console.log('get subject hitt',req);
    try{
        const User = await userData.aggregate([  {
            '$match': {
               _id : ObjectId(req.params.id),               
            },
        },
         {"$sort" :{"registeredOn" : 1}},
        //  {"$project" : {
        //     // address : 1,
        //     first_name:1,
        //     last_name:1,
        //     email_id:1, 
        //     // email_id2: 1,           
        //     // company_name:1,
        //     // phone_number:1,
        //     // registeredOn:1
        //  }},
         { '$lookup': { 
            'from': 'companyAssets',
            'localField': '_id',
            'foreignField': 'MapCustomer',
            'as': 'assetDetails' 
        } },
            { '$lookup': { 
            'from': 'assetTypes',
            'localField': 'assetDetails.AssetTypeId',
            'foreignField': 'AssetTypeId',
            'as': 'AssetTypeDetails' 
        } },
        {"$project" : {
            // first_name:1,
            // last_name:1,
            // email_id:1, 
        //     "assetDetails._id" : 1,
        //     "assetDetails.AssetId" : 1,
        //     "assetDetails.AssetName" : 1,
        //     "assetDetails.AssetType" : 1,
        //     "assetDetails.AssetTypeId" : 1,
        //     "assetDetails.Gateway" : 1,
        //     "assetDetails.InstallationDate":1,
        //     "assetDetails.status":1,
        //    "assetDetails.ManufacturingId":1
        "AssetTypeDetails.Name" : 1,
        "AssetTypeDetails.AssetTypeId" : 1
            
            
         }},
        ]);  
         
        return {
            msg: 'successfully Find',
            data: User
        }
    }catch (error){
        // console.log('error occure in get lcd Config',error);
        return Promise.reject('error occure in get lcd Config')
    }
}

// // getUosplUserList
// async function getUosplUserList(req){
//     // console.log('get subject hitt',req);
//     try{
//         const getAllUsers = await userData.aggregate([  {
//             '$match': {
//                 'company_id': Number(req.query.companyId),
//                 "isDelete" : false,
//             },
//         },
//          {"$sort" :{"registeredOn" : 1}},
//          {"$project" : {
//             // address : 1,
//             first_name:1,
//             last_name:1,
//             email_id:1, 
//             // email_id2: 1,           
//             company_name:1,
//             // phone_number:1,
//             // registeredOn:1


//          }}
        
//         ]);  
//         // console.log(getAllUsers)      
//         return {
//             msg: 'successfully Find',
//             data: getAllUsers
//         }
//     }catch (error){
//         // console.log('error occure in get lcd Config',error);
//         return Promise.reject('error occure in get lcd Config')
//     }
// }

async function updateOEMUser(req){
    // console.log('updateSubject hitt');
    try{
        let userId = req.params.id      
        // let existDevice = await deviceData.find({$and: [{AssetId : req.body.AssetId }]});
        // if(existDevice.length){
        //     return {
        //         msg : "user already exist"
        //     }
        // }else { 
            const updatedDevice = await userData.findByIdAndUpdate(userId,{$set:{
                first_name:req.body.first_name,    
                 last_name:req.body.last_name,
                // company_name:req.body.company_name,
                phone_number:req.body.phone_number,
                dial_code : req.body.dial_code,
                address:req.body.address}});
            if(updatedDevice!=null){
                return {
                    msg: 'Updated Successfully ',
                    data: updatedDevice
                }
            }else{
                return {
                    msg : "user not exist"
                }
            }
        // }
    }catch (error){
        // console.log('error occure in update Lcd Config',error);
        return Promise.reject(error)
    }
}

// putUser
async function putUser(req){
    // console.log('updateSubject hitt');
    try{
        let userId = req.params.id      
        // let existDevice = await deviceData.find({$and: [{AssetId : req.body.AssetId }]});
        // if(existDevice.length){
        //     return {
        //         msg : "user already exist"
        //     }
        // }else { 
            const updatedDevice = await userData.findByIdAndUpdate(userId,{$set:{
                first_name:req.body.first_name,    
                 last_name:req.body.last_name,
                // company_name:req.body.company_name,
                phone_number:req.body.phone_number,
                dial_code : req.body.dial_code,
                // address:req.body.address
            }});
            if(updatedDevice!=null){
                return {
                    msg: 'Updated Successfully ',
                    data: updatedDevice
                }
            }else{
                return {
                    msg : "Lcd Config not exist"
                }
            }
        // }
    }catch (error){
        // console.log('error occure in update Lcd Config',error);
        return Promise.reject(error)
    }
}

// putUserNotification
async function putUserNotification(req){
    // console.log('updateSubject hitt');
    try{
        let userId = req.params.id      
        // let existDevice = await deviceData.find({$and: [{AssetId : req.body.AssetId }]});
        // if(existDevice.length){
        //     return {
        //         msg : "user already exist"
        //     }
        // }else { 
            const updatedDevice = await userData.findByIdAndUpdate(userId,{$set:{
                emailNotifications:req.body.emailNotifications,    
                 smslNotifications:req.body.smslNotifications}});
            if(updatedDevice!=null){
                return {
                    msg: 'Updated Successfully ',
                    data: updatedDevice
                }
            }else{
                return {
                    msg : "User not exist"
                }
            }
        // }
    }catch (error){
        // console.log('error occure in update Lcd Config',error);
        return Promise.reject(error)
    }
}


// putUserChangePassword
async function putUserChangePassword(req){
    // console.log('updateSubject hitt');
    try{
        let userId = req.params.id      
        // console.log(req.body)
        
           const user = await userData.aggregate([  {
            '$match': {
                _id : ObjectId(req.params.id),
                "isDelete" : false,
                "administrator" : false
               
            },
        },
        //  {"$sort" :{"registeredOn" : 1}},
        //  {"$project" : {
        //     address : 1,
        //     first_name:1,
        //     last_name:1,
        //     email_id:1, 
        //     // email_id2: 1,           
        //     company_name:1,
        //     phone_number:1,
        //     registeredOn:1,
        //     emailNotifications :1,
        //     smslNotifications : 1


        //  }}
        
        ]);  

        // console.log(user)
        let valid = await bcrypt.compare(req.body.oldPassword , user[0].password);
        // console.log(valid)
         if (valid && req.body.newPassword === req.body.conformPassword ) {
            // Enhanced password validation
            if (req.body.newPassword.length < 8) {
                return {
                    msg: 'Password must be at least 8 characters long',
                    data: { success: false }
                };
            }

            // Check for mixed character types
            const hasUpperCase = /[A-Z]/.test(req.body.newPassword);
            const hasLowerCase = /[a-z]/.test(req.body.newPassword);
            const hasNumbers = /[0-9]/.test(req.body.newPassword);
            const hasSpecialChars = /[!@#$%^&*]/.test(req.body.newPassword);

            // Count how many character types are present
            const characterTypesCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars]
                .filter(Boolean).length;

            if (characterTypesCount < 3) {
                return {
                    msg: 'Password must contain at least 3 of the following: uppercase letters, lowercase letters, numbers, and special characters (!@#$%^&*)',
                    data: { success: false }
                };
            }

            let salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.newPassword, salt);
        // console.log(req.body)
         const updatedUser = await userData.findByIdAndUpdate(userId,{$set:{
                password:req.body.password}});
            if(updatedUser!=null){
                return {
                    msg: 'Updated Successfully ',
                    data: updatedUser
                }
         }
        }else{
               let response = { "success": false }
            // console.warn('res:', response)
            return {
                msg: 'Invalid  password',
                data: response
            }
         }
         
      
    }catch (error){
        // console.log('error occure in update Lcd Config',error);
        return Promise.reject(error)
    }
}


async function deleteOEMUser(req){
    // console.log('deleteSubject hitt');
    try{
        let userId = req.params.id
        // console.log("deviceId",LcdConfigId);
        const deletedUser = await userData.findByIdAndUpdate(userId,{$set:{isDelete:true}});
        return {
            msg: 'Deleted successfully '
        }
       
    }catch (error){
        // console.log('error occure in delete LcdConfig',error);
        return Promise.reject('error occure in delete LcdConfig')
    }
}

// Verify password setup token
async function verifyPasswordSetupToken(req) {
    try {
        const { token } = req.query;
        
        if (!token) {
            return {
                success: false,
                msg: 'Token is required'
            };
        }

        let payload;
        try {
            payload = jwt.verify(token, config.SECRET);
        } catch (e) {
            return {
                success: false,
                msg: 'Invalid or expired token'
            };
        }

        if (payload.type !== 'password_setup') {
            return { success: false, msg: 'Invalid token' };
        }

        const user = await userData.findOne({ _id: payload.userId, email_id: payload.email, isDelete: false });
        if (!user) {
            return { success: false, msg: 'User not found' };
        }
        // If password already set, consider the link used
        if (user.isPasswordSet) {
            return { success: false, msg: 'Password already set' };
        }
        return {
            success: true,
            msg: 'Token is valid',
            userId: user._id
        };
    } catch (error) {
        return Promise.reject(error);
    }
}

// Set password using setup token
async function setPasswordWithToken(req) {
    try {
        const { token, password, confirmPassword } = req.body;
        
        if (!token || !password || !confirmPassword) {
            return {
                success: false,
                msg: 'All fields are required'
            };
        }

        if (password !== confirmPassword) {
            return {
                success: false,
                msg: 'Passwords do not match'
            };
        }

        // Enhanced password validation
        if (password.length < 8) {
            return {
                success: false,
                msg: 'Password must be at least 8 characters long'
            };
        }

        // Check for mixed character types
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const hasSpecialChars = /[!@#$%^&*]/.test(password);

        // Count how many character types are present
        const characterTypesCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars]
            .filter(Boolean).length;

        if (characterTypesCount < 3) {
            return {
                success: false,
                msg: 'Password must contain at least 3 of the following: uppercase letters, lowercase letters, numbers, and special characters (!@#$%^&*)'
            };
        }

        let payload;
        try {
            payload = jwt.verify(token, config.SECRET);
        } catch (e) {
            return {
                success: false,
                msg: 'Invalid or expired token'
            };
        }

        if (payload.type !== 'password_setup') {
            return { success: false, msg: 'Invalid token' };
        }

        const user = await userData.findOne({ _id: payload.userId, email_id: payload.email, isDelete: false });
        if (!user) {
            return { success: false, msg: 'User not found' };
        }
        // Prevent reuse if already set
        if (user.isPasswordSet) {
            return { success: false, msg: 'Password already set' };
        }

        // Hash the new password
        let salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update user with new password and clear setup token
        await userData.findByIdAndUpdate(user._id, {
            $set: {
                password: hashedPassword,
                isPasswordSet: true,
                passwordSetupToken: null,
                passwordSetupExpires: null
            }
        });

        return {
            success: true,
            msg: 'Password set successfully. You can now login.'
        };
    } catch (error) {
        return Promise.reject(error);
    }
}

// Send password setup link for existing users
async function sendPasswordSetupLink(req) {
    try {
        const { email } = req.body;
        
        if (!email) {
            return {
                success: false,
                msg: 'Email is required'
            };
        }

        const user = await userData.findOne({
            email_id: email,
            isDelete: false
        });

        if (!user) {
            return {
                success: false,
                msg: 'User not found'
            };
        }

        // Generate token, link and send email via helper
        const token = generatePasswordSetupToken(user._id, user.email_id);
        const setupLink = buildPasswordSetupLink(token);
        await sendPasswordSetupEmail(email, setupLink, 'resend');

        return {
            success: true,
            msg: 'Password setup link sent to your email'
        };
    } catch (error) {
        return Promise.reject(error);
    }
}

module.exports = {
    insertOEMUser,
    updateOEMUser,
    getOEMUser,
    deleteOEMUser,
    // getUosplUser,
    // updateUosplUser,
    // deleteUosplUser,
    // getUosplUserList,
    getOEMDeiceByuser,
    putUserNotification,
    getUserById,
    putUserChangePassword,
    putUser,
    getAssetTypeByuser,
    getUserByCompanyId,
    verifyPasswordSetupToken,
    setPasswordWithToken,
    sendPasswordSetupLink
}



