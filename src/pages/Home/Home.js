import React, { useState, useEffect } from "react";
import api from "../../components/services/api";
import { useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";

const Home = () => {
  const [images, setImages] = useState([]); // Images from the server
  const [files, setFiles] = useState([]);   // Files selected by the user
  const [titles, setTitles] = useState([]);  // Titles for each file
  const user_id = JSON.parse(localStorage.getItem('user_id'));
  const [data , setData] = useState({})

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await api.get(`accounts/image_get/${user_id}/`);
      setImages(response.data);
    } catch (error) {
      console.error("Axios Error:", error.response || error.message || error);
    }
  };

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleTitleChange = (e, index) => {
    const updatedTitles = [...titles];
    updatedTitles[index] = e.target.value;
    setTitles(updatedTitles);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    Array.from(files).forEach((file, index) => {
      formData.append("files", file); // Append each file to FormData
      formData.append("titles", titles[index] || ""); // Append corresponding title
    });
  
    try {
      console.log("FormData:", formData);
  
      // Send the POST request with FormData
      await api.post(`accounts/image_post/${user_id}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      console.log("Upload successful!");
      fetchImages(); // Fetch updated images
    } catch (error) {
      console.error("Upload failed:", error.response?.data || error.message);
    }
  };

  const handleDelete = (fileIndex) => {
    // Remove the image from the files array
    const updatedFiles = [...files];
    updatedFiles.splice(fileIndex, 1);
    setFiles(updatedFiles);

    // Remove the title associated with this image
    const updatedTitles = [...titles];
    updatedTitles.splice(fileIndex, 1);
    setTitles(updatedTitles);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h1>Image Management</h1>

        {/* Bulk Upload */}
        <div>
          <input type="file" multiple onChange={handleFileChange} />
          {Array.from(files).map((file, index) => (
            <div key={index} style={{ marginBottom: "20px" }}>
              <img
                src={URL.createObjectURL(file)} // Preview the selected file
                alt={`preview-${index}`}
                width={100}
                style={{ marginRight: "10px" }}
              />
              <input
                type="text"
                placeholder="Enter title"
                value={titles[index] || ""}
                onChange={(e) => handleTitleChange(e, index)}
              />
              <button onClick={() => handleDelete(index)}>Delete</button>
            </div>
          ))}
          <button onClick={handleUpload}>Upload</button>
        </div>

        {/* Display Images from Server */}
        <div>
          {images.map((image, index) => (
            <div key={image.id}>
                {console.log(image.image , 'dssssssssssssss')}
              <img src={`http://127.0.0.1:8000/${image.image}`} alt={image.title} width={100} />
              <h3>{image.title}</h3>
              <button onClick={() => handleDelete(image.id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default Home;
