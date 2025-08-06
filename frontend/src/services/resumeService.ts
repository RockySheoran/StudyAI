export const uploadResume = async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('resume', file);
  
    const response = await fetch('http://localhost:8002/api/resume/upload', {
      method: 'POST',
      body: formData,
    });
  
    if (!response.ok) {
      throw new Error('Failed to upload resume');
    }
  };
  
  export const deleteResume = async (): Promise<void> => {
    const response = await fetch('http://localhost:8002/api/resume', {
      method: 'DELETE',
    });
  
    if (!response.ok) {
      throw new Error('Failed to delete resume');
    }
  };
  
  export const getResume = async (): Promise<{ url: string }> => {
    const response = await fetch('http://localhost:8002/api/resume');
    if (!response.ok) {
      throw new Error('Failed to fetch resume');
    }
    return response.json();
  };