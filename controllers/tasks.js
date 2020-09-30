// Init code
const router = require('express').Router();
const bodyParser = require("body-parser");
const { check, validationResult } = require("express-validator");
const Task = require("./../models/tasks");
const moment = require("moment");
const verifyToken = require("./../middleware/verifyToken");


// Middleware Setup
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

//default route
router.all('/', (req, res) => {
    return res.json({
        status: true,
        message: "Task Controller Default Route",
    })
});


// create new task route
router.post('/newTask', verifyToken, [
    //check empty fields
    check("title").not().isEmpty().trim().escape(),// escape changes special symbol in html ententies
    check("description").not().isEmpty().trim().escape(),
    check("deadline").not().isEmpty().trim(),

], (req, res) => {
    // check form data validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) 
    {
        return res.json({
            status: false,
            message: "Form Data Validation Error.",
            error: errors.array(),
        });

    }
     // new task object/model
     const temp= new Task({
         title: req.body.title,
         description: req.body.description,
         deadline: req.body.deadline,
         userID: req.userID,
     });

     temp.save((error,result)=>{
         if(error)
         {
             return res.json({
                 status: false,
                 message:"Fail to create new task.",
                 error: error,
             });
         }

         // Ok
         return res.json({
             status: true,
             message:"New task created Successfully",
             result: result,
         });
     });
});

//read all task from user 
router.get('/getAllTask',verifyToken,(req,res)=>{
    //find task in database
    Task.find({userID:req.userID},(error,result)=>{
        // check error
        if(error){
            return res.json({
                status: false,
                message: "task read fail.",
                error: error
            });
        }
        //if result is empty
        if(!result){
            return res.json({
                status:false,
                message: "No task found."
            });
        }

        // output task data
        return res.json({
            status: true,
            message: "Task read Success",
            result: result,
        });
    });
});


// get a single task rest api
router.get(
  '/getTask',
  verifyToken,
  [
    // check task id
    check('taskID').not().isEmpty().trim().escape()
  ],
  (req, res)=>{
// check form data validation error
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.json({
    status: false,
    message: 'Form data validation error.',
    error: errors.array()
  });
}

    // get a task code goes here
    Task.findOne(
      { _id : req.body.taskID, userID : req.userID },
      function(error, result){
        // check db error
        if (error){
          return res.json({
            status : false,
            message : 'get task failed.',
            error : error
          });
        }

        // check result is empty
        if (!result){
          return res.json({
            status : false,
            message : 'No task document exists.'
          });
        }

        // OK
        return res.json({
          status : true,
          message : 'Get task success.',
          result : result
        });
      }
    );
  }
);

// update task route
router.put('/updateTask',verifyToken,[
  //check form data
  check('description').not().isEmpty().trim().escape(),
  check('deadline').not().isEmpty().trim(),
  check('taskID').not().isEmpty().trim(),

],(req,res)=>{
   // check form data validation
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
       return res.json({
           status: false,
           message: "Form Data Validation Error.",
           error: errors.array(),
       });

   }

   // task update
   Task.findOneAndUpdate({_id: req.body.taskID,userID:req.userID},{
     description:req.body.description,
     deadline: req.body.deadline,
     updateOn: moment().format('DD/MM/YYYY')+';'+moment().format('hh/mm/ss'),
   },(error,result)=>{
     if(error)
     {
       return res.json({
         status: false,
         message: 'Task Update Fail',
         error: error

       });
     }

      // check result is empty
      if (!result){
        return res.json({
          status : false,
          message : 'No task document exists.'
        });
      }
     //ok
     return res.json({
       status: true,
       message: "Task updated successfully",
       result: result,
     });
   }
    )
});

// update task status
router.put('/updateTaskStatus',verifyToken,[
  //check data
   check('isDone').not().isEmpty().trim().escape(),
   check('taskID').not().isEmpty().trim().escape(),

],(req,res)=>{
  const errors = validationResult(req);
   if (!errors.isEmpty()) {
       return res.json({
           status: false,
           message: "Form Data Validation Error.",
           error: errors.array(),
       });

   }

   // update task status
   Task.findOneAndUpdate({_id: req.body.taskID,userID:req.userID},{ //req.body. , req.
     isDone: req.body.isDone, 
     updateOn: moment().format('DD/MM/YYYY')+';'+moment().format('hh/mm/ss'), 
   },(error,result)=>{
     // check db error
     if(error){
       return res.json({
         status: false,
         message:"Task status update failed."
       });
     }
    
      // check result is empty
      if (!result){
        return res.json({
          status : false,
          message : 'No task document exists.'
        });
      }
     // ok 
     return res.json({
       status: true,
       message:"Task Status update successfully",
       result: result
     });
   });
});

// delete task
router.delete('/deleteTask',verifyToken,[
  check('taskID').not().isEmpty().trim().escape(),
],(req,res)=>{
  // delete task
  Task.findOneAndRemove({_id:req.body.taskID,userID:req.userID},(error,result)=>{
    //check db error
    if(error)
    {
      return res.json({
        status: false,
        message: 'Task delete fail',
        error: error
      });
    }
    // Ok
    return res.json({
      status: true,
      message: "Task delete successfully",
      result : result
    })

  });
})

//exports
module.exports= router;