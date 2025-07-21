import React, { useState, useEffect } from 'react';
import { fetchNotes, createNote, updateNote, deleteNote as deleteNoteAPI } from '../api.js';

export default function NotesView({ currentUser }) {
  const [notes, setNotes] = useState([]);
  const [noteForm, setNoteForm] = useState({
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });

  // Load notes from MongoDB Atlas
  useEffect(() => {
    loadNotes();
  }, [currentUser]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        return;
      }
      
      const notesData = await fetchNotes(token);
      setNotes(notesData);
      console.log(`Loaded ${notesData.length} notes from MongoDB Atlas`);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async () => {
    if (!noteForm.title.trim() || !noteForm.description.trim()) {
      alert('Please fill in both title and description');
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      
      const noteData = {
        title: noteForm.title.trim(),
        description: noteForm.description.trim()
      };
      
      const newNote = await createNote(token, noteData);
      setNotes([newNote, ...notes]);
      setNoteForm({ title: '', description: '' });
      console.log('Note added to MongoDB Atlas:', newNote._id);
      alert('Note added successfully!');
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      
      await deleteNoteAPI(token, noteId);
      setNotes(notes.filter(note => note._id !== noteId));
      console.log('Note deleted from MongoDB Atlas:', noteId);
      alert('Note deleted successfully!');
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (note) => {
    setEditingNote(note._id);
    setEditForm({ title: note.title, description: note.description });
  };

  const saveEdit = async (noteId) => {
    if (!editForm.title.trim() || !editForm.description.trim()) {
      alert('Please fill in both title and description');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      
      const noteData = {
        title: editForm.title.trim(),
        description: editForm.description.trim()
      };
      
      const updatedNote = await updateNote(token, noteId, noteData);
      setNotes(notes.map(note => 
        note._id === noteId ? updatedNote : note
      ));
      setEditingNote(null);
      setEditForm({ title: '', description: '' });
      console.log('Note updated in MongoDB Atlas:', noteId);
      alert('Note updated successfully!');
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Failed to update note: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setEditForm({ title: '', description: '' });
  };

  return (
    <div className="notes-view" style={{
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh',
      padding: '0'
    }}>
      <div className="notes-header" style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        color: 'white',
        padding: '40px 30px',
        borderRadius: '0 0 30px 30px',
        marginBottom: '30px',
        boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ 
              margin: '0 0 10px 0', 
              fontSize: '2.5rem', 
              fontWeight: 'bold',
              display: 'flex', 
              alignItems: 'center', 
              gap: '15px'
            }}>
              <i className="fas fa-sticky-note" style={{ color: '#fbbf24' }}></i>
              My Notes
            </h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '1.1rem' }}>
              Organize your thoughts and ideas
            </p>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            padding: '15px 25px',
            borderRadius: '20px',
            fontSize: '16px',
            fontWeight: 'bold',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <i className="fas fa-file-alt" style={{ marginRight: '8px' }}></i>
            {notes.length} Notes
          </div>
        </div>
      </div>
      
      <div style={{ padding: '0 30px 30px 30px' }}>
        {/* Add new note form */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          padding: '35px',
          borderRadius: '20px',
          marginBottom: '30px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)'
          }}></div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '25px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              width: '50px',
              height: '50px',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '15px'
            }}>
              <i className="fas fa-plus" style={{ color: 'white', fontSize: '20px' }}></i>
            </div>
            <div>
              <h3 style={{ 
                margin: 0, 
                color: '#1e293b', 
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                Create New Note
              </h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                Add a new note to your collection
              </p>
            </div>
          </div>
          
          <div style={{ display: 'grid', gap: '20px' }}>
            <input
              type="text"
              placeholder="Enter note title..."
              value={noteForm.title}
              onChange={(e) => setNoteForm({...noteForm, title: e.target.value})}
              style={{
                width: '100%',
                padding: '18px 24px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                fontFamily: 'inherit',
                background: '#ffffff'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#6366f1';
                e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
            
            <textarea
              placeholder="Enter note description..."
              value={noteForm.description}
              onChange={(e) => setNoteForm({...noteForm, description: e.target.value})}
              rows="5"
              style={{
                width: '100%',
                padding: '18px 24px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '15px',
                lineHeight: '1.6',
                resize: 'vertical',
                fontFamily: 'inherit',
                transition: 'all 0.3s ease',
                background: '#ffffff'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#6366f1';
                e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
            
            <button 
              onClick={addNote} 
              disabled={loading}
              style={{
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                border: 'none',
                padding: '18px 32px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                width: 'fit-content',
                marginLeft: 'auto'
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 10px 30px rgba(99, 102, 241, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <i className="fas fa-plus"></i>
              {loading ? 'Adding Note...' : 'Add Note'}
            </button>
          </div>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6366f1',
            fontWeight: 'bold',
            background: 'white',
            borderRadius: '20px',
            marginBottom: '30px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
          }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '24px', marginBottom: '10px' }}></i>
            <br />
            Processing your request...
          </div>
        )}

        {/* Display notes */}
        <div className="notes-list">
          {notes.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 40px',
              color: '#64748b',
              fontSize: '18px',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: '20px',
              border: '2px dashed #cbd5e1',
              marginBottom: '30px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto'
              }}>
                <i className="fas fa-sticky-note" style={{ fontSize: '32px', color: 'white' }}></i>
              </div>
              <h3 style={{ margin: '0 0 10px 0', color: '#334155', fontSize: '1.5rem' }}>
                No notes yet
              </h3>
              <p style={{ margin: 0, fontSize: '1rem' }}>
                Create your first note to get started organizing your thoughts!
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '25px',
              marginBottom: '30px'
            }}>
              {notes.map(note => (
                <div 
                  key={note._id} 
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    padding: '30px',
                    borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.1)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 20px 50px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, #${Math.floor(Math.random()*16777215).toString(16)}, #6366f1)`
                  }}></div>
                  
                  {editingNote === note._id ? (
                    <div>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '15px 20px',
                          border: '2px solid #6366f1',
                          borderRadius: '12px',
                          fontSize: '18px',
                          marginBottom: '15px',
                          fontWeight: 'bold',
                          background: '#ffffff'
                        }}
                      />
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        rows="5"
                        style={{
                          width: '100%',
                          padding: '15px 20px',
                          border: '2px solid #6366f1',
                          borderRadius: '12px',
                          fontSize: '15px',
                          marginBottom: '20px',
                          resize: 'vertical',
                          fontFamily: 'inherit',
                          background: '#ffffff',
                          lineHeight: '1.6'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => saveEdit(note._id)}
                          style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '12px 20px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: '600',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                          <i className="fas fa-save"></i> Save
                        </button>
                        <button 
                          onClick={cancelEdit}
                          style={{
                            background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '12px 20px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: '600',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                          <i className="fas fa-times"></i> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '20px'
                      }}>
                        <h3 style={{
                          margin: 0,
                          color: '#1e293b',
                          fontSize: '1.4rem',
                          fontWeight: 'bold',
                          flex: 1,
                          lineHeight: '1.3'
                        }}>
                          {note.title}
                        </h3>
                        <div style={{ display: 'flex', gap: '8px', marginLeft: '15px' }}>
                          <button 
                            onClick={() => startEdit(note)}
                            style={{
                              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                              color: 'white',
                              border: 'none',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontWeight: '600',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                          >
                            <i className="fas fa-edit"></i> Edit
                          </button>
                          <button 
                            onClick={() => deleteNote(note._id)}
                            style={{
                              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                              color: 'white',
                              border: 'none',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontWeight: '600',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                          >
                            <i className="fas fa-trash"></i> Delete
                          </button>
                        </div>
                      </div>
                      <p style={{
                        color: '#475569',
                        lineHeight: '1.7',
                        margin: '0 0 20px 0',
                        whiteSpace: 'pre-wrap',
                        fontSize: '15px'
                      }}>
                        {note.description}
                      </p>
                      <div style={{
                        paddingTop: '20px',
                        borderTop: '1px solid #e2e8f0',
                        fontSize: '13px',
                        color: '#64748b',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <i className="fas fa-user" style={{ color: 'white', fontSize: '10px' }}></i>
                          </div>
                          <strong>{note.username}</strong>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <i className="fas fa-clock"></i> 
                          {new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}