var express=require("express")
var userRoute=require("./Routes/userRoute");
var mongoose=require("mongoose");
var fileuploader=require("express-fileupload");
var cors=require('cors'); 
var dotenv=require("dotenv")
dotenv.config()
var nodemailer=require('nodemailer')
const axios=require('axios')
var cloudinary=require("cloudinary").v2;
 cloudinary.config({
      cloud_name:process.env.cloud_name,
    api_key:process.env.api_key,
    api_secret:process.env.api_secret,
})

var app=express()
app.use(fileuploader());
app.use(cors());
/// generative ai key
app.listen("2005",()=>{
    console.log("server started******* this site rohit+++")

})
let mongodbUrlAtlas=process.env.atlaurl;
mongoose.connect(mongodbUrlAtlas).then(()=>{
    console.log("connected");
}).catch((err)=>{
    console.log(err.message);
})

app.use(express.urlencoded(true));
app.use("/user",userRoute);
app.use("/",(req,resp)=>{
    resp.send("==+++++++++++> welcome -----+++++")
 })
// gemini key
//const apiKey="AIzaSyB7qgsMaGSXsqDHCPjTnVzZ1YZwzDDTfXk";
//const endpoint=  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
app.post('/generate',async(req,resp)=>{
    console.log("file aa rhi aa")
    console.log(req.files)
   
  const file = req.files.file;
  const base64 = file.data.toString('base64');
  const mimetype = file.mimetype;
   
   try {
    const geminiresp = await axios.post(endpoint, {
      contents: [
        {
          parts: [
            {
              text: "Describe this image:"
            },
            {
              inlineData: {
                mimeType: mimetype,
                data: base64
              }
            }
          ]
        }
      ]
    }, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    const resultText = geminiresp.data.candidates?.[0]?.content?.parts?.[0]?.text;
    resp.json({ response: resultText });

  } catch (err) {
    console.error(err.response?.data || err.message);
    resp.status(500).json({ msg: err.response?.data || err.message });
  }
})

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyB7qgsMaGSXsqDHCPjTnVzZ1YZwzDDTfXk");

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function RajeshBansalKaChirag(imgurl)
{
const myprompt = "Read the text on picture and tell all the information in adhaar card and give output STRICTLY in JSON format {adhaar_number:'', name:'', gender:'', dob: ''}. Dont give output as string."   
    const imageResp = await fetch(imgurl)
        .then((response) => response.arrayBuffer());

    const result = await model.generateContent([
        {
            inlineData: {
                data: Buffer.from(imageResp).toString("base64"),
                mimeType: "image/jpeg",
            },
        },
        myprompt,
    ]);
    console.log(result.response.text())
            
            const cleaned = result.response.text().replace(/```json|```/g, '').trim();
            console.log(cleaned)
            const jsonData = JSON.parse(cleaned);
            console.log(jsonData);

    return jsonData

}
//=============

app.post("/picreader", async function (req, resp) {
  console.log("pic reader")
    let fileName;
    if (req.files != null) 
        {
      console.log("file yes")
        fileName = req.files.imggg.name;
        let locationToSave = __dirname + "/uploads/" + fileName;//full ile path
        
        req.files.imggg.mv(locationToSave);//saving file in uploads folder
        
        //saving ur file/pic on cloudinary server
        try{
        await cloudinary.uploader.upload(locationToSave).then(async function (picUrlResult) 
        {      
            console.log("file upload")
             console.log(picUrlResult.url);   

            let jsonData=await RajeshBansalKaChirag( picUrlResult.url);
            
            resp.send(jsonData);//save in database

        });

       
        }
        catch(err)
        {
            resp.send(err.message)
        }

    }
})