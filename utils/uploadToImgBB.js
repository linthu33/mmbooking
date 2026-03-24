const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const uploadToImgBB = async (file) => {
  const formData = new FormData();
  // ImgBB API Key ကို .env ထဲမှာ ထည့်ထားဖို့ အကြံပြုလိုပါတယ်
  formData.append('image', fs.createReadStream(file.path));

  try {
    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=10bb79a4310e4d63a495fdd1c60cacf4`, // သင့် API Key ထည့်ပါ
      formData,
      { headers: formData.getHeaders() }
    );
    
    // ပုံတင်ပြီးရင် Local ကဖိုင်ကို ဖျက်ပေးပါ (Storage မပွအောင်)
    fs.unlinkSync(file.path);
    
    return response.data.data.url; // ImgBB ကပေးတဲ့ Direct Link ကို ပြန်ပေးမယ်
  } catch (error) {
    console.error("ImgBB Upload Error:", error.message);
    throw new Error("Failed to upload image to ImgBB");
  }
};