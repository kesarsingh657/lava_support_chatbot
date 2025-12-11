import React, { useState } from 'react';
import { X, Search, FileText, ChevronLeft, ExternalLink } from 'lucide-react';

const HelpdeskForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: '', email: '', course: '', queryType: '', query: '', product: 'Lava Mobile', description: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    if (!formData.fullName || !formData.email || !formData.query) {
      alert('Please fill in all required fields');
      return;
    }
    onSubmit(formData);
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px', border: '1px solid #e0e0e0', borderRadius: '4px',
    fontSize: '14px', boxSizing: 'border-box', outline: 'none', background: 'white'
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px'
    }}>
      <div style={{
        background: '#f5f5f5', borderRadius: '8px', width: '100%', maxWidth: '700px', 
        maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          background: '#2c3e50', color: 'white', padding: '20px 30px', borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px'
        }}>
          <h2 style={{fontSize: '24px', fontWeight: 'normal', margin: 0}}>Submit a ticket</h2>
        </div>
        <div style={{padding: '40px 30px', overflowY: 'auto', flex: 1, background: 'white'}}>
          <div>
            <div style={{marginBottom: '24px'}}>
              <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333'}}>
                Full Name <span style={{color: '#dc3545'}}>*</span>
              </label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={{marginBottom: '24px'}}>
              <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333'}}>
                Your Registered E-mail ID <span style={{color: '#dc3545'}}>*</span>
              </label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={{marginBottom: '24px'}}>
              <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333'}}>
                Course <span style={{color: '#dc3545'}}>*</span>
              </label>
              <select name="course" value={formData.course} onChange={handleChange} style={inputStyle}>
                <option value="">Choose...</option>
                <option value="Technical Support">Technical Support</option>
                <option value="Warranty Issue">Warranty Issue</option>
                <option value="General Inquiry">General Inquiry</option>
              </select>
            </div>
            <div style={{marginBottom: '24px'}}>
              <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333'}}>
                Query Type
              </label>
              <select name="queryType" value={formData.queryType} onChange={handleChange} style={inputStyle}>
                <option value="">Choose...</option>
                <option value="Phone Not Starting">Phone Not Starting</option>
                <option value="Charging Issue">Charging Issue</option>
                <option value="Software Problem">Software Problem</option>
                <option value="Hardware Defect">Hardware Defect</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div style={{marginBottom: '24px'}}>
              <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333'}}>
                Your Query <span style={{color: '#dc3545'}}>*</span>
              </label>
              <input type="text" name="query" value={formData.query} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={{marginBottom: '24px'}}>
              <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333'}}>
                Product
              </label>
              <select name="product" value={formData.product} onChange={handleChange} style={inputStyle}>
                <option value="Lava Mobile">Lava Mobile</option>
              </select>
            </div>
            <div style={{marginBottom: '24px'}}>
              <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333'}}>
                Description <span style={{color: '#dc3545'}}>*</span>
              </label>
              <textarea name="description" value={formData.description} onChange={handleChange} 
                style={{...inputStyle, minHeight: '120px', fontFamily: 'inherit'}} 
                placeholder="Type something" />
            </div>
            <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-start', marginTop: '30px'}}>
              <button type="button" onClick={onClose} style={{
                padding: '10px 24px', border: '1px solid #ccc', borderRadius: '4px',
                background: '#f8f9fa', cursor: 'pointer', fontSize: '14px', color: '#333'
              }}>Cancel</button>
              <button onClick={handleSubmit} style={{
                padding: '10px 24px', border: 'none', borderRadius: '4px',
                background: '#2c3e50', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '500'
              }}>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LavaSupportChatbot = () => {
  const [view, setView] = useState('initial');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [showFeedbackAnimation, setShowFeedbackAnimation] = useState(false);

  const questions = [
    { id: 1, q: "My phone is not switching ON", a: "Step 1 - Clean the charging port using a dry brush to remove dust.\nStep 2 - Charge the phone for 15-30 minutes with a working cable & charger.\nStep 3 - Hard reset the phone (Power + Volume Down)." },
    { id: 2, q: "My phone is hanging/freezing frequently", a: "Step 1 – Clear phone storage by removing unwanted data.\nStep 2 – Clear application cache data.\nStep 3 - Update all applications from Play Store.\nStep 4 – Frequently close running apps.\nStep 5 – Reset app preferences.\nStep 6 – Update device software.\nStep 7 – Factory data reset (backup first)." },
    { id: 3, q: "Apps not downloading from Play Store", a: "Step 1 – Clear Play Store cache data.\nStep 2 - Update all applications from Play Store." },
    { id: 4, q: "My phone is overheating", a: "Step 1 – Clear phone storage.\nStep 2 - Update all applications.\nStep 3 – Use model-specific adaptor and cable.\nStep 4 – Reset app preferences.\nStep 5 – Update device software.\nStep 6 – Factory reset (backup first)." },
    { id: 5, q: "Slow charging issue", a: "Step 1 – Use model-specific adaptor and cable.\nStep 2 – Check if phone supports fast charging.\nStep 3 – Check for fast-charging icon on screen." }
  ];

  const handleFeedback = (type) => {
    setFeedback(type);
    if (type === 'yes') {
      setShowFeedbackAnimation(true);
      setTimeout(() => {
        setShowFeedbackAnimation(false);
        setFeedback(null);
      }, 3000);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'linear-gradient(135deg, #f5f5f5, #e8e8e8)', padding: '16px'
    }}>
      {!chatOpen ? (
        <button
          onClick={() => setChatOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '70px',
            height: '70px',
            background: 'linear-gradient(135deg, #ffc0cb, #d3d3d3)',
            border: 'none',
            borderRadius: '50%',
            boxShadow: '0 8px 24px rgba(255, 182, 193, 0.4)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse 2s infinite'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(255, 182, 193, 0.6)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 182, 193, 0.4)';
          }}
        >
          <style>{`
            @keyframes pulse {
              0%, 100% {
                box-shadow: 0 8px 24px rgba(255, 182, 193, 0.4);
              }
              50% {
                box-shadow: 0 8px 32px rgba(255, 182, 193, 0.7), 0 0 0 8px rgba(255, 192, 203, 0.2);
              }
            }
            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            @keyframes slideInBottom {
              from {
                opacity: 0;
                transform: translateY(100%);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
          `}</style>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" 
                  fill="white" opacity="0.9"/>
            <circle cx="8" cy="10" r="1.5" fill="#ff69b4"/>
            <circle cx="12" cy="10" r="1.5" fill="#ff69b4"/>
            <circle cx="16" cy="10" r="1.5" fill="#ff69b4"/>
          </svg>
        </button>
      ) : (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', width: '400px', height: '650px',
          background: '#fff', borderRadius: '16px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'slideUp 0.3s ease-out'
        }}>
        
        <div style={{
          background: 'linear-gradient(135deg, #4b5a7d, #3d4a67)', color: 'white', padding: '24px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{textAlign: 'left'}}>
            <div style={{
              fontSize: '28px', 
              fontWeight: 'bold', 
              color: '#dc2626',
              marginBottom: '4px',
              fontFamily: 'Impact, "Arial Black", sans-serif',
              letterSpacing: '1px'
            }}>LAVA</div>
            <div style={{fontSize: '13px', fontWeight: '400', color: '#e5e7eb', marginBottom: '12px'}}>
              Lava Care: Always here to help
            </div>
            {view !== 'initial' && (
              <div style={{fontSize: '13px', opacity: 0.9, marginTop: '8px'}}>
                {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </div>
            )}
          </div>
          <button
            onClick={() => setChatOpen(false)}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px',
              cursor: 'pointer',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{flex: 1, overflowY: 'auto', padding: '20px', background: '#fafafa', position: 'relative'}}>
          {view === 'initial' && (
            <div>
              <div style={{background: '#f3f4f6', borderRadius: '12px', padding: '16px', marginBottom: '20px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, #ffd4e5, #ffc0d9)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '18px'
                  }}>L</div>
                  <div>
                    <p style={{fontSize: '14px', fontWeight: '600', margin: 0, color: '#1f2937'}}>Lava Support</p>
                    <p style={{fontSize: '12px', color: '#6b7280', margin: 0}}>
                      {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                  </div>
                </div>
                <div style={{marginLeft: '52px'}}>
                  <p style={{fontSize: '13px', color: '#374151', margin: '0 0 12px 0'}}>
                    Welcome to Lava Support Helpdesk! We're here to assist you.
                  </p>
                  <p style={{fontSize: '13px', color: '#374151', margin: '0 0 8px 0'}}>
                    Please submit your query through this form:
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ffa6c9',
                      fontSize: '13px',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      padding: 0,
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Submit a support ticket <ExternalLink size={14} />
                  </button>
                  <p style={{fontSize: '12px', color: '#6b7280', margin: 0, lineHeight: '1.5'}}>
                    <strong>PLEASE NOTE:</strong> Our support team is available from 10 AM to 11:59 PM, 
                    and it may take up to 24 hours to address your issue due to high volume.
                    <br />Thank you!
                  </p>
                </div>
              </div>

              <div style={{
                border: '2px solid #ffd4e5',
                borderRadius: '10px',
                padding: '16px',
                background: 'white',
                marginBottom: '12px'
              }}>
                <h3 style={{
                  fontSize: '16px', 
                  fontWeight: '700', 
                  color: '#1f2937', 
                  margin: '0 0 12px 0',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between'
                }}>
                  Frequently Asked Questions
                  <Search size={18} color="#6b7280" />
                </h3>

                <button onClick={() => setView('questions')} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
                  background: '#fff', border: '1px solid #ffd4e5', borderRadius: '10px', cursor: 'pointer',
                  fontSize: '14px', fontWeight: '600', color: '#1f2937'
                }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, #ffd4e5, #ffc0d9)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center'
                  }}><FileText size={20} color="white" /></div>
                  <span style={{flex: 1, textAlign: 'left'}}>Find answers to common questions</span>
                </button>
              </div>
            </div>
          )}

          {view === 'questions' && !selectedQuestion && (
            <div>
              <button onClick={() => setView('initial')} style={{
                background: 'transparent', border: 'none', color: '#4b5a7d', cursor: 'pointer',
                fontSize: '14px', marginBottom: '16px', padding: '8px 0', fontWeight: '600', 
                display: 'flex', alignItems: 'center', gap: '4px'
              }}><ChevronLeft size={18} /> Back</button>

              <div style={{
                background: 'linear-gradient(135deg, #ffe6f0, #fff0f5)', 
                borderRadius: '10px', padding: '16px', marginBottom: '16px', 
                border: '1px solid #ffd4e5'
              }}>
                <h3 style={{fontSize: '13px', fontWeight: '700', color: '#6b7280', margin: '0 0 4px 0'}}>
                  CATEGORY
                </h3>
                <p style={{fontSize: '16px', fontWeight: '700', color: '#4b5a7d', margin: 0}}>
                  Find answers to common questions
                </p>
              </div>

              <div style={{maxHeight: '450px', overflowY: 'auto'}}>
                {questions.map(q => (
                  <button key={q.id} onClick={() => setSelectedQuestion(q)} style={{
                    width: '100%', textAlign: 'left', padding: '14px 12px', background: 'white',
                    border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px',
                    color: '#374151', cursor: 'pointer', marginBottom: '8px', display: 'flex',
                    alignItems: 'center', gap: '10px'
                  }}><FileText size={16} color="#ffa6c9" /> {q.q}</button>
                ))}
              </div>
            </div>
          )}

          {selectedQuestion && (
            <div>
              <button onClick={() => setSelectedQuestion(null)} style={{
                background: 'transparent', border: 'none', color: '#4b5a7d', cursor: 'pointer',
                fontSize: '14px', marginBottom: '16px', padding: '8px 0', fontWeight: '600', 
                display: 'flex', alignItems: 'center', gap: '4px'
              }}><ChevronLeft size={18} /> Back</button>

              <div style={{
                background: 'white', borderRadius: '12px', padding: '20px', 
                marginBottom: '16px', border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                <h4 style={{fontSize: '16px', fontWeight: '700', color: '#1f2937', marginBottom: '16px'}}>
                  {selectedQuestion.q}
                </h4>
                <p style={{
                  fontSize: '14px', color: '#4b5563', lineHeight: '1.8', 
                  whiteSpace: 'pre-line', margin: 0
                }}>
                  {selectedQuestion.a}
                </p>
              </div>

              {!feedback && (
                <div style={{
                  background: 'linear-gradient(135deg, #fff0f5, #ffe6f0)', 
                  borderRadius: '12px', padding: '20px', border: '1px solid #ffd4e5'
                }}>
                  <p style={{fontSize: '15px', fontWeight: '600', color: '#1f2937', marginBottom: '14px'}}>
                    Was this helpful?
                  </p>
                  <div style={{display: 'flex', gap: '12px'}}>
                    <button onClick={() => handleFeedback('yes')} style={{
                      flex: 1, padding: '12px', background: 'white', border: '2px solid #10b981',
                      borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: '8px', color: '#10b981', fontWeight: '600', fontSize: '14px',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#10b981';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.color = '#10b981';
                    }}
                    >👍 Yes</button>
                    <button onClick={() => handleFeedback('no')} style={{
                      flex: 1, padding: '12px', background: 'white', border: '2px solid #ef4444',
                      borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: '8px', color: '#ef4444', fontWeight: '600', fontSize: '14px',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#ef4444';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.color = '#ef4444';
                    }}
                    >👎 No</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {showFeedbackAnimation && (
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              right: '20px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
              animation: 'slideInBottom 0.5s ease-out',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'white'
            }}>
              <div style={{
                fontSize: '32px',
                animation: 'bounce 0.6s ease-in-out'
              }}></div>
              <div>
                <p style={{fontSize: '16px', fontWeight: '700', margin: '0 0 4px 0'}}>
                  Thank you for your feedback!
                </p>
                <p style={{fontSize: '13px', margin: 0, opacity: 0.9}}>
                  We're glad we could help you today
                </p>
              </div>
            </div>
          )}

          {feedback === 'no' && (
            <div style={{
              background: 'linear-gradient(135deg, #fff0f5, #ffe6f0)', 
              borderRadius: '12px', padding: '20px', border: '1px solid #ffd4e5', textAlign: 'center'
            }}>
              <p style={{fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 16px 0'}}>
                We're sorry this wasn't helpful. Please submit a ticket for personalized assistance.
              </p>
              <button onClick={() => { setFeedback(null); setSelectedQuestion(null); }} style={{
                padding: '12px 24px', background: 'linear-gradient(135deg, #ffd4e5, #ffc0d9)',
                border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontWeight: '600',
                fontSize: '14px', transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >Back to Questions</button>
            </div>
          )}
        </div>
      </div>
      )}


      {showForm && (
        <HelpdeskForm 
          onClose={() => setShowForm(false)} 
          onSubmit={(d) => { 
            alert('✅ Ticket submitted successfully!'); 
            setShowForm(false);
          }} 
        />
      )}
    </div>
  );
};

export default LavaSupportChatbot;