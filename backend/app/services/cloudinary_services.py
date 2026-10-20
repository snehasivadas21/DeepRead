import cloudinary
import cloudinary.uploader

from app.core.config import settings


cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)


def upload_profile_image(file):
    result = cloudinary.uploader.upload(
        file,
        folder="deepread/profiles",
        resource_type="image",
        transformation=[
            {
                "width": 400,
                "height": 400,
                "crop": "limit",
            },
            {
                "quality": "auto",
                "fetch_format": "auto",
            },
        ],
    )

    return result["secure_url"], result["public_id"]


def delete_profile_image(public_id: str | None):
    if public_id:
        cloudinary.uploader.destroy(
            public_id,
            resource_type="image",
        )
