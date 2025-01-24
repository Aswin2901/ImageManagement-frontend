import React, { useState, useEffect } from "react";
import { useDrop, useDrag, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import api from "../../components/services/api";
import "./Home.css";

const DraggableImage = ({ image, index, moveImage, handleEdit, handleDelete }) => {
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

  return (
    <div className="image-card" ref={(node) => ref(drop(node))}>
      <img src={image.imagePreview || `http://127.0.0.1:8000/${image.image}`} alt={image.title} />
      <input
        type="text"
        value={image.title}
        onChange={(e) => handleEdit(index, "title", e.target.value)}
        placeholder="Enter title"
      />
      <div className="image-actions">
        <button onClick={() => handleEdit(index)}>Edit</button>
        <button onClick={() => handleDelete(index)}>Delete</button>
      </div>
    </div>
  );
};

const Home = () => {
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [isOrderChanged, setIsOrderChanged] = useState(false);
  const user_id = JSON.parse(localStorage.getItem("user_id"));

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

  const handleEdit = (index, field, value) => {
    const updatedImages = [...images];
    updatedImages[index][field] = value;
    setImages(updatedImages);
  };

  const handleDelete = (index) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
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
              handleEdit={handleEdit}
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
