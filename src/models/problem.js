const mongoose= require("mongoose");
const {Schema}=mongoose;

const problemschema=new Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    tags:{
        type:String,
        enum:["array","linkedList","stack","queue","deque","hashMap","set",
  "heap","priorityQueue","tree","binaryTree","binarySearchTree",
  "trie","graph","matrix","string"],
        required:true
    },
    difficulty:{
        type:String,
        enum:["easy","hard","medium"],
        required:true
    },
    visibleTestCases:[
        {
            input:{
                type:String,
                required:true,
            },
            output:{
                type:String,
                required:true,
            },
            explanation:{
                type:String,
                required:true
            }
        }
    ],

    hiddenTestCases:[
        {
            input:{
                type:String,
                required:true,
            },
            output:{
                type:String,
                required:true,
            }
        }
    ],

    startCode: [
        {
            language:{
                type:String,
                required:true,
            },
            initialCode:{
                type:String,
                required:true
            }
        }
    ],
    referenceSolution:[
        {
            language:{
                type:String,
                required:true,
            },
            completeCode:{
                type:String,
                required:true
            }
        }
    ]
    // problemCreator:{
    //     type: Schema.Types.ObjectId,
    //     ref:'user',
    //     required:true
    // }
})


const Problem = mongoose.model('problem',problemschema);

module.exports = Problem;