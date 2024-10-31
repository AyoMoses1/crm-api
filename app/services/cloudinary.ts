import { v2 as cloudinary } from 'cloudinary'
import { env } from 'process'

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
})

export const uploadImage = async (imageData: string) => {
  try {
    const result = await cloudinary.uploader.upload(imageData, {
      folder: 'emr',
    })
    return result
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error)
    throw error
  }
}
