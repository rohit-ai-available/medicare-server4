var jwt = require("jsonwebtoken");
function validateTokenn2(req,resp,next)
{
        console.log("********")
       
       const full_token = req.headers['authorization'];//keyword
        console.log(full_token);
    
        var ary=full_token.split(" ");
        let actualToken=ary[1];
        let TokenValidObj;
        console.log(process.env.SEC_KEY)
    
        try{
            TokenValidObj= jwt.verify(actualToken,process.env.SEC_KEY);
            console.log(TokenValidObj);
            if(TokenValidObj!=null)
            {
                const payload = jwt.decode(ary[1]);
                console.log(payload);
                next();
                //resp.json({status:true,msg:"**Aauthorized",item:payload});
            }
            else
            resp.json({status:false,msg:"**Invalid Token"});
            
            
        }
        catch(err)
        { 
            console.log("pppp"+err.message)
            resp.json({status:false,msg:err.message});
            return;
        }
            
}
module.exports={validateTokenn2};