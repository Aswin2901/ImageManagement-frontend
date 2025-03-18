import React, { useState, useEffect } from "react";
import { useDrop, useDrag, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import api from "../../components/services/api";
import "./Home.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLadderWater, faUpload, faUser ,faTimes } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";

const DraggableImage = ({ image, index, moveImage, handleUpdate, handleDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(image.title);
  const [editedImage, setEditedImage] = useState(null);

  const [, ref] = useDrag({
    type: "image",
    item: { index },
  });

  const [, drop] = useDrop({
    accept: "image",
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveImage(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEditedImage(e.target.files[0]);
    }
  };

  const saveChanges = () => {
    handleUpdate(index, editedTitle, editedImage);
    setIsEditing(false);
  };

  return (
    <div className="image-card" ref={(node) => ref(drop(node))}>
  {!isEditing ? (
    <>
      <img
        src={`https://aswin2901.pythonanywhere.com${image.image}`}
        alt={image.title}
      />
      <p>{image.title}</p>
      <div className="image-actions">
        <button onClick={() => setIsEditing(true)}>Edit</button>
        <button onClick={() => handleDelete(index)}>Delete</button>
      </div>
    </>
  ) : (
    <div className="edit-section">
      <div className="edit-image">
        <img
          src={
            editedImage
              ? URL.createObjectURL(editedImage)
              : `https://aswin2901.pythonanywhere.com${image.image}`
          }
          alt="Preview"
        />
        <input type="file" onChange={handleImageChange} />
      </div>
      <input
        type="text"
        value={editedTitle}
        onChange={(e) => setEditedTitle(e.target.value)}
        placeholder="Enter title"
      />
      <div className="edit-actions">
        <button onClick={saveChanges}>Save</button>
        <button onClick={() => setIsEditing(false)}>Cancel</button>
      </div>
    </div>
  )}
</div>
  );
};
const Home = () => {
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [isOrderChanged, setIsOrderChanged] = useState(false);
  const user_id = JSON.parse(localStorage.getItem("user_id"));
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isUploadPopupOpen, setIsUploadPopupOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()


  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true); // Start loading
      const response = await api.get("accounts/image_get/"); // No need to pass user_id
      setImages(response.data.map((image) => ({ ...image, imagePreview: null })));
    } catch (error) {
      console.error("Error fetching images:", error.response || error.message);
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).map((file) => ({
      file,
      imagePreview: URL.createObjectURL(file),
      title: "",
    }));
    setFiles([...files, ...selectedFiles]);
  };

  const handleUpdate = async (index, updatedTitle, updatedImage) => {
    setLoading(true); // Start loading
    const updatedImages = [...images];
    updatedImages[index].title = updatedTitle;
  
    const formData = new FormData();
    formData.append("title", updatedTitle);
    if (updatedImage) {
      formData.append("image", updatedImage);
    }
  
    try {
      const imageId = updatedImages[index].id;
      const response = await api.patch(`accounts/images_edit/${imageId}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updatedImages[index] = response.data; // Update with server response
      fetchImages();
      alert("Image updated successfully.");
    } catch (error) {
      console.error("Error updating image:", error.response?.data || error.message);
      alert("Failed to update image. Please try again.");
    } finally {
      setLoading(false); // End loading
    }
  };
  

  const handleDelete = async (index) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this image?");
    if (!confirmDelete) {
      return; // If the user cancels, exit the function
    }

    setLoading(true); // Start loading
  
    const imageId = images[index].id;
  
    // Optimistic update
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
  
    try {
      await api.delete(`accounts/images_delete/${imageId}/`);
      setSuccessMessage("Image deleted successfully."); 
      fetchImages();
      setSuccessMessage(""); 
    } catch (error) {
      console.error("Error deleting image:", error.response?.data || error.message);
      setErrorMessage("Failed to delete image. Please try again."); // Display error message
      fetchImages(); // Refresh the image list in case of failure
    } finally {
      setLoading(false); // End loading
    }
  };

  const moveImage = (fromIndex, toIndex) => {
    console.log('move .....')
    const updatedImages = [...images];
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);
  
    setImages(updatedImages);
  
    // Prepare the order data for the backend
    const orderData = updatedImages.map((image, index) => ({
      id: image.id,
      order: index,
    }));
  
    // Send updated order to the backend
    api
      .post("accounts/update_order/", {
        images: orderData,
      })
      .then(() => {
        console.log("Order updated successfully");
      })
      .catch((error) => {
        console.error("Failed to update order:", error.response?.data || error.message);
      });
  };

  const handleUpload = async () => {
    setIsUploadPopupOpen(false);
    setLoading(true); // Start loading
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append("files", file.file);
      formData.append("titles", file.title || "Untitled");
    });
  
    try {
      // No need to manually pass `user_id`, backend should get it from token
      await api.post("accounts/image_post/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
  
      fetchImages();  // Refresh images after upload
      setFiles([]);   // Clear selected files
      
    } catch (error) {
      console.error("Upload failed:", error.response?.data || error.message);
    } finally {
      setLoading(false); // End loading
    }
  };


  const removeImage = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
  };

  return (
      <div>
        {loading && (
          <div className="loading-overlay">
            <p>Loading...</p>
          </div>
        )}

        {!loading && (
          <div className="full-head">
            <div className="header-container">
              {/* Upload Button with Icon */}
              <button
                className="toggle-upload-button"
                onClick={() => setIsUploadPopupOpen(true)}
              >
                <FontAwesomeIcon icon={faUpload} />
              </button>

              

              <h1 className="heading">Image Management</h1>

              {/* Profile Button */}
              <button className="profile-button"
              onClick={() => navigate('/profile')}
              >
                <FontAwesomeIcon icon={faUser} />
              </button>
            </div>
          </div>
            )}

        {/* Upload Section */}
        {isUploadPopupOpen && (
  <div className="upload-popup-overlay">
    <div className="upload-popup">
    <button
        className="close-popup-button"
        onClick={() => setIsUploadPopupOpen(false)}
      >
        <FontAwesomeIcon icon={faTimes} /> {/* Close icon */}
      </button>
      <h2>Upload Images</h2>
      <div className="upload-input-container">
        <input type="file" multiple onChange={handleFileChange} />
        <button className="upload-btn" onClick={handleUpload}>
          Upload
        </button>
      </div>
      <div className="preview-container">
        {files.map((file, index) => (
          <div key={index} className="preview-card">
            <img src={file.imagePreview} alt="Preview" className="preview-image" />
            <div className="image-info">
              <input
                type="text"
                placeholder="Enter title"
                value={file.title}
                onChange={(e) => {
                  const updatedFiles = [...files];
                  updatedFiles[index].title = e.target.value;
                  setFiles(updatedFiles);
                }}
              />
              <button
                className="remove-image-btn"
                onClick={() => removeImage(index)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

        <DndProvider backend={HTML5Backend}>
          <div className="image-management-container">
            <div className="message-container">
              {successMessage && <div className="success-message">{successMessage}</div>}
              {errorMessage && <div className="error-message">{errorMessage}</div>}
            </div>

            {/* Uploaded Images Section */}
            <div className="image-grid-container">
              {images.length === 0 ? (
                <h4>Please upload your images</h4>
              ) : (
                images.map((image, index) => (
                  <DraggableImage
                    key={image.id || index}
                    image={image}
                    index={index}
                    moveImage={moveImage}
                    handleUpdate={handleUpdate}
                    handleDelete={handleDelete}
                  />
                ))
              )}
            </div>

          </div>
        </DndProvider>
      </div>
  );
};

export default Home;
