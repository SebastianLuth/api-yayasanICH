const db = require('../models');
const Users = db.users;
const Products = db.products;
const path = require('path')
const fs = require('fs');
const Modules = db.modules;
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const session = require('express-session')


exports.register = async (req, res) => {
  // To get data
    const {username, email, first_name, last_name, password, password_confirm} = req.body

  if(!username || !email || !password || !password_confirm || !first_name || !last_name) {
    return res.status(422).send({'message': 'Invalid fields'})
  }

  if(password !== password_confirm) return res.status(422).send({'message': 'Passwords do not match'})

  const userExists = await Users.exists({email}).exec()

  if(userExists) return res.sendStatus(409)

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // to create a new data user to db
    await Users.create({email, username, password: hashedPassword, first_name, last_name})

    return res.sendStatus(201)
  } catch (error) {
    // console.error('Error in registration:', error);
    return res.status(400).send({message: "Could not register"})
  }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // checking the email is filled
        if(!email || !password) return res.status(422).send({message : 'Invalid Fields'});

        const user = await Users.findOne({email}).exec();

        // checking User is already exist in db
        if(!user) return res.status(401).send({message: "Email is not Exist"})

        const match = await bcrypt.compare(password, user.password)

        if(!match) return res.status(401).send({message : 'Email or Password is incorrect'})
        
        //For access Token
        const accessToken = jwt.sign({
            id: user._id
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: '1800s'
        })

        // For refresh Token
        const refreshToken = jwt.sign(
            {
              id: user.id
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
              expiresIn: '1d'
            }
          )
          user.refresh_token = refreshToken
          await user.save()
          
          res.cookie('refresh_token', refreshToken, {httpOnly: true, sameSite : 'None' ,secure: true, maxAge: 24*60*60*1000})
           res.send({access_token: accessToken})

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.logout = async (req,res) => {
    const cookies = req.cookies;

    //check the cookies is there have a token or not
    if(!cookies || !cookies.refresh_token) return res.sendStatus(204 )

    // to get refresh token in cookies
    const refreshToken = cookies.refreshToken
    const user = await Users.findOne({refresh_token: refreshToken}).exec()
    
    if(!user){
        res.clearCookie('refresh_token', {httpOnly: true, sameSite: 'None', secure: true})
        return res.sendStatus(204)
    }
    // to remove refresh token
    user.refresh_token = null
    await user.save()

    res.clearCookie('refresh_token', {httpOnly: true, sameSite: 'None', secure: true})
    res.sendStatus(204)
}

exports.refresh = async(req,res) => {
  const cookies = req.cookies;
  //checking there are tokens in cookies or not 
  if(!cookies || !cookies.refresh_token) { 
      // console.log("No refresh token found in cookies");
      return res.sendStatus(401);
  }

  const refreshToken = cookies.refresh_token;
  // console.log("Refresh token:", refreshToken);

  const user = await Users.findOne({refresh_token: refreshToken}).exec();
  // console.log("User:", user);

  if(!user) {
      // console.log("User not found for the provided refresh token");
      return res.sendStatus(403);
  }

  jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
          if(err || user.id !== decoded.id) {
              // console.log("Token verification failed or user ID mismatch");
              return res.sendStatus(403);
          }

          const accessToken = jwt.sign(
              { id: decoded.id },
              process.env.ACCESS_TOKEN_SECRET,
              { expiresIn: '1800s' }
          );

          // console.log("New access token generated:", accessToken);
          res.send({access_token: accessToken});
      }
  );
};


exports.user = async (req, res) => {
    const user = req.user
    return res.status(200).send(user)
}

exports.getAllPurchasedModules = async (req, res) => {
  try{
    
    const userId = req.user.id;

    // Find the user by ID and populate the purchased modules' details
    const user = await Users.findById(userId).populate({
      path: 'purchasedCourses.modules.moduleId',
      model: 'modules'}).exec();  
    
    // User no found
      if (!user) {
        return res.status(404).send({ message: "User not found" });
    }

    // to create a new array Map the user's purchased courses to extract course ID and module IDs
    const purchasedModules = user.purchasedCourses.map(course => ({
      courseId: course.courseId,
      courseName: course.courseName,
      courseImage: course.courseImage,
      modules: course.modules.map(module => module.moduleId)
  }));
    res.status(200).send(purchasedModules);

}catch(error){
  res.status(500).send({ message: error.message });
  }
}

exports.getPurchasedModulesByCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    // Find the user by ID and filter the purchased courses to match the given courseId
    const user = await Users.findById(userId).populate({
      path: 'purchasedCourses.modules.moduleId',
      model: 'modules'
    }).exec();

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const purchasedCourse = user.purchasedCourses.find(course => course.courseId.toString() === courseId);

    if (!purchasedCourse) {
      return res.status(404).send({ message: "Course not found in user's purchases" });
    }

    res.status(200).send(purchasedCourse.modules.map(module => module.moduleId));
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.downloadModuleFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { moduleId } = req.params;

    console.log(`User ID: ${userId}`);
    console.log(`Module ID: ${moduleId}`);

    const user = await Users.findById(userId).populate({
        path: 'purchasedCourses.modules.moduleId',
        model: 'modules'
    }).exec();

    if (!user) {
        console.log('User not found');
        return res.status(404).send({ message: "User not found" });
    }

    console.log(`User found: ${user.username}`);
    
    const hasAccess = user.purchasedCourses.some(course => {
        return course.modules.some(module => {
          if (!module.moduleId) {
            return false;
        }
            console.log(`Checking module: ${module.moduleId} with access: ${module.accessGranted}`);
            return module.moduleId._id.toString() === moduleId && module.accessGranted;
        });
    });

    if (!hasAccess) {
        console.log('Access denied');
        return res.status(403).send({ message: "Access denied" });
    }

    const module = await Modules.findById(moduleId);

    if (!module || !module.pdf_url) {
        console.log('File not found');
        return res.status(404).send({ message: "File not found" });
    }

   const response = await axios.get(module.pdf_url, { responseType: 'stream' });
    response.data.pipe(res);

} catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
}
};
