import React, { useState, useEffect } from "react";
import { useDrop, useDrag, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import api from "../../components/services/api";
import "./Home.css";

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
          <img src={`http://127.0.0.1:8000/${image.image}`} alt={image.title} />
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
              src={editedImage ? URL.createObjectURL(editedImage) : `http://127.0.0.1:8000/${image.image}`}
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
          <button onClick={saveChanges}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};
const Home = () => {
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [isOrderChanged, setIsOrderChanged] = useState(false);
  const user_id = JSON.parse(localStorage.getItem("user_id"));
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await api.get(`accounts/image_get/${user_id}/`);
      setImages(response.data.map((image) => ({ ...image, imagePreview: null })));
    } catch (error) {
      console.error("Error fetching images:", error.response || error.message);
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
    }
  };
  

  const handleDelete = async (index) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this image?");
    if (!confirmDelete) {
      return; // If the user cancels, exit the function
    }
  
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
    }
  };

  const moveImage = (fromIndex, toIndex) => {
    const updatedImages = [...images];
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);
    setImages(updatedImages);
    setIsOrderChanged(true); // Show save button
  };

  const handleUpload = async () => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file.file);
      formData.append("titles", file.title || "Untitled");
    });

    try {
      await api.post(`accounts/image_post/${user_id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchImages();
      setFiles([]);
    } catch (error) {
      console.error("Upload failed:", error.response?.data || error.message);
    }
  };

  const saveOrder = async () => {
    try {
      await api.post(`accounts/save_order/${user_id}/`, {
        images: images.map((image, index) => ({ id: image.id, order: index })),
      });
      alert("Order saved!");
      setIsOrderChanged(false);
    } catch (error) {
      console.error("Failed to save order:", error.response?.data || error.message);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="image-management-container">
        <h1 className="heading">Image Management</h1>

        <div className="message-container">
          {successMessage && <div className="success-message">{successMessage}</div>}
          {errorMessage && <div className="error-message">{errorMessage}</div>}
        </div>

        {/* Toggleable Upload Section */}
        <button
          className="toggle-upload-button"
          onClick={() => setShowUploadSection(!showUploadSection)}
        >
          {showUploadSection ? " Close" : "Upload Images"}
        </button>

        {showUploadSection && (
          <div className="upload-section">
            <input type="file" multiple onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
            <div className="preview-container">
              {files.map((file, index) => (
                <div key={index} className="preview-card">
                  <img src={file.imagePreview} alt="Preview" />
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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Uploaded Images Section */}
        <div className="image-grid-container">
          {images.map((image, index) => (
            <DraggableImage
              key={image.id || index}
              image={image}
              index={index}
              moveImage={moveImage}
              handleUpdate={handleUpdate}
              handleDelete={handleDelete}
            />
          ))}
        </div>

        {isOrderChanged && (
          <button onClick={saveOrder} className="save-order-button">
            Save Order
          </button>
        )}
      </div>
    </DndProvider>
  );
};

export default Home;
