import { useState, useEffect } from 'react';
import { Plus, Folder, ArrowLeft, FileText, Trash2 } from 'lucide-react';
import { supabase } from './supabaseClient';

export default function App() {
  const [notes, setNotes] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', folder_name: '', unit_name: '', content: '', fileToUpload: null });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const { data, error } = await supabase.from('notes').select('*').order('created_at', { ascending: false });
    if (data) setNotes(data);
    if (error) console.error("Error fetching data:", error);
  };

  const folders = [...new Set(notes.map(n => n.folder_name || 'General Projects'))];
  const currentFolderNotes = notes.filter(n => (n.folder_name || 'General Projects') === currentFolder);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setFormData({ ...formData, fileToUpload: file });
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    let finalAttachment = null;

    if (formData.fileToUpload) {
      const file = formData.fileToUpload;
      const fileName = `${Date.now()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('attachments').upload(fileName, file);
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('attachments').getPublicUrl(fileName);
        finalAttachment = { name: file.name, url: publicUrl, type: file.type };
      }
    }

    await supabase.from('notes').insert([{
      title: formData.title,
      folder_name: formData.folder_name || 'General Projects',
      unit_name: formData.unit_name || 'Unit 1',
      content: formData.content,
      attachment: finalAttachment
    }]);

    setIsModalOpen(false);
    setFormData({ title: '', folder_name: '', unit_name: '', content: '', fileToUpload: null });
    fetchNotes();
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this file permanently?')) {
      await supabase.from('notes').delete().eq('id', id);
      fetchNotes();
    }
  };

  return (
    <>
      {/* Animated Background Waves */}
      <div className="wave-container">
        <div className="wave"></div>
        <div className="wave"></div>
      </div>

      <div className="app-container">
        
        {/* Academic Header (Top Right) */}
        <div className="academic-header">
          <span>Vishnu Sharma</span>
          0801IT251152 | B3<br/>
          Session 2025–2029
        </div>

        <header>
          <h1>{currentFolder ? currentFolder : 'My Projects'}</h1>
          <p>{currentFolder ? `Unit-wise files and notes for ${currentFolder}` : 'Select a folder to view your units and files, or create a new one.'}</p>
          
          <div className="header-actions">
            {currentFolder && (
              <button className="btn-floating btn-outline" onClick={() => setCurrentFolder(null)}>
                <ArrowLeft size={20} /> Back to Folders
              </button>
            )}
            <button className="btn-floating" onClick={() => setIsModalOpen(true)}>
              <Plus size={22} /> Add New File
            </button>
          </div>
        </header>

        {!currentFolder && (
          <div className="folder-grid">
            {folders.length === 0 ? <p style={{color: '#a3b8cc'}}>No projects yet. Click Add New File to create your first folder!</p> : null}
            {folders.map(folder => (
              <div key={folder} className="folder-card" onClick={() => setCurrentFolder(folder)}>
                <Folder size={54} color="#00f2fe" style={{marginBottom: '1.5rem', filter: 'drop-shadow(0 0 12px rgba(0, 242, 254, 0.6))'}} />
                <h3>{folder}</h3>
                <p>{notes.filter(n => (n.folder_name || 'General Projects') === folder).length} files inside</p>
              </div>
            ))}
          </div>
        )}

        {currentFolder && (
          <div className="notes-grid">
            {currentFolderNotes.map(note => (
              <div key={note.id} className="note-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className="unit-badge">{note.unit_name}</span>
                  <Trash2 size={20} color="#fe0979" style={{cursor:'pointer', filter: 'drop-shadow(0 0 8px rgba(254,9,121,0.5))'}} onClick={(e) => handleDelete(note.id, e)} />
                </div>
                <h3 className="note-title">{note.title}</h3>
                <p className="note-content">{note.content}</p>
                
                {note.attachment && (
                  <a href={note.attachment.url} target="_blank" rel="noopener noreferrer" className="attachment-link">
                    <FileText size={18} /> {note.attachment.name}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 3D Glass Modal */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Upload Project File</h2>
              <form onSubmit={handleSaveNote}>
                <div className="form-group">
                  <label>Project / Folder Name</label>
                  <input required value={formData.folder_name} onChange={e => setFormData({...formData, folder_name: e.target.value})} placeholder="e.g., Engineering Mathematics" />
                </div>
                <div className="form-group">
                  <label>Unit Name</label>
                  <input required value={formData.unit_name} onChange={e => setFormData({...formData, unit_name: e.target.value})} placeholder="e.g., Unit 1: Graph Theory" />
                </div>
                <div className="form-group">
                  <label>File Title</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g., Dijkstra's Algorithm Notes" />
                </div>
                <div className="form-group">
                  <label>Description / Notes</label>
                  <textarea required rows="3" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} placeholder="Briefly describe this file..." />
                </div>
                <div className="form-group" style={{marginTop: '2rem'}}>
                  <label>Attach PDF or Image</label>
                  <input type="file" onChange={handleFileChange} />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-floating btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-floating">Save to Database</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}