import React from 'react';

const FileUpload = ({ onFileContentExtracted }) => {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      onFileContentExtracted(text);
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <input type="file" accept=".txt,.pdf,.docx" onChange={handleFileUpload} />
    </div>
  );
};

export default FileUpload;
