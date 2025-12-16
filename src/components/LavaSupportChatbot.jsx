import React, { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, ChevronLeft, X, MessageCircle } from "lucide-react";

const BASE_URL = "http://192.168.114.60:8082";
const TICKET_FORM_URL = "https://your-support-portal.com/submit-ticket"; // Replace with your actual URL

const LavaSupportChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState("welcome");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [viewHistory, setViewHistory] = useState([]);

  const [feedbackType, setFeedbackType] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [ticketData, setTicketData] = useState({
    fullName: "",
    email: "",
    course: "",
    queryType: "",
    subject: "",
    description: ""
  });

  const [visibleQuestions, setVisibleQuestions] = useState([]);

  const fetchQuestions = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/chatbot/questions`);
      const data = await res.json();
      const formattedData = data.map(item => ({
        id: item[0],
        question: item[1],
        createdAt: item[2],
      }));
      setQuestions(formattedData);

      // Animate questions appearance
      setVisibleQuestions([]);
      formattedData.forEach((_, index) => {
        setTimeout(() => {
          setVisibleQuestions(prev => [...prev, index]);
        }, index * 150);
      });
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const fetchAnswers = async (questionId) => {
    setSelectedQuestion(questionId);
    try {
      const res = await fetch(
        `${BASE_URL}/api/chatbot/questions/${questionId}/responses`
      );
      const data = await res.json();
      setAnswers(data);
      setCurrentView("answer");
    } catch (error) {
      console.error("Error fetching answers:", error);
    }
  };

  const submitFeedback = async (wasHelpful) => {
    try {
      await fetch(`${BASE_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: selectedQuestion,
          wasHelpful,
          contactNumber: null,
          email: null,
          queryText: null,
        }),
      });


      setFeedbackType(wasHelpful ? "like" : "dislike");
      setCurrentView("thankYouFeedback");

    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };
  const handleTicketChange = (e) => {
    setTicketData({ ...ticketData, [e.target.name]: e.target.value });
  };

  const handleTicketSubmit = () => {
    if (!ticketData.fullName || !ticketData.email || !ticketData.subject) {
      alert("Please fill required fields");
      return;
    }

    alert("Ticket submitted successfully (demo)");
    setTicketData({
      fullName: "",
      email: "",
      course: "",
      queryType: "",
      subject: "",
      description: ""
    });
    setCurrentView("welcome");
  };



  const handleFormSubmit = () => {
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill in all required fields");
      return;
    }
    alert("Message sent successfully!");
    setFormData({ name: "", email: "", phone: "", message: "" });
    setCurrentView("welcome");
  };

  useEffect(() => {
    if (isOpen && currentView === "questionList") {
      fetchQuestions();
    }
  }, [isOpen, currentView]);

  const handleBack = () => {
  if (currentView === "answer") {
    setCurrentView("questionList");
    setSelectedQuestion(null);
    setAnswers([]);
  } 
  else if (currentView === "submitTicket") {
    // 👈 FIX: back from submit ticket goes to thank you or welcome
    setCurrentView("welcome");
  }
  else if (currentView === "helpdesk") {
    setCurrentView("welcome");
  }
  else if (currentView === "questionList") {
    setCurrentView("welcome");
  }
  else if (currentView === "thankYouFeedback") {
    setCurrentView("welcome");
  }
};


  return (
    <>
      <div style={styles.chatIcon} onClick={() => setIsOpen(true)}>
        <MessageCircle size={28} color="white" />
      </div>

      {isOpen && (
        <div style={styles.chatbot}>
          {/* HEADER */}
          <div style={styles.header}>
            {currentView !== "welcome" && (
              <button style={styles.backButton} onClick={handleBack}>
                <ChevronLeft size={24} />
              </button>
            )}
            <div style={styles.headerContent}>
              <div style={styles.logo}>
                <span style={styles.logolava}>LAVA</span>

              </div>
            </div>
            <button style={styles.closeBtn} onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {currentView === "welcome" && (
            <div style={styles.body}>
              <div style={styles.welcomeView}>
                <h1 style={styles.welcomeTitle}>Hello there!</h1>
                <p style={styles.welcomeSubtitle}>Chat with us</p>

                <div style={styles.chatSection}>
                  <p style={styles.chatTitle}>
                    {/* <span onClick={() => setCurrentView("helpdesk")}>A</span> */}
                  </p>
                  <div
                    style={styles.helpdeskCard}
                    onClick={() => setCurrentView("helpdesk")}
                  >

                    <div>
                      <div style={styles.helpdeskName}>Lava Helpdesk</div>

                    </div>
                    <div style={styles.helpdeskTime}>3:14 PM</div>
                  </div>
                </div>

                <div style={styles.faqSection}>
                  <div style={styles.faqHeader}>
                    <p style={styles.faqTitle}>Frequently Asked Questions</p>
                  </div>
                  <div
                    style={styles.faqCard}
                    onClick={() => {
                      setCurrentView("questionList");
                      fetchQuestions();
                    }}
                  >
                    <div style={styles.faqIcon}>F</div>
                    <div style={styles.faqText}>Find answers to common questions</div>
                  </div>
                </div>

                <p style={styles.footerText}>Welcome to LAVA Support</p>
              </div>
            </div>
          )}

          {currentView === "questionList" && (
            <div style={styles.body}>
              <div style={styles.questionListView}>
                <div style={styles.categoryHeader}>
                  <div style={styles.categoryIconSmall}>F</div>
                  <div>
                    {/* <div style={styles.categoryLabel}>CATEGORY</div> */}
                    <div style={styles.categoryName}>Find answers to common questions</div>
                  </div>
                </div>

                <div style={styles.questionsList}>
                  {questions.map((q, index) => (
                    <div
                      key={q.id}
                      style={{
                        ...styles.questionItem,
                        opacity: visibleQuestions.includes(index) ? 1 : 0,
                        transform: visibleQuestions.includes(index)
                          ? 'translateY(0)'
                          : 'translateY(20px)',
                        transition: 'opacity 0.5s ease, transform 0.5s ease'
                      }}
                      onClick={() => fetchAnswers(q.id)}
                    >
                      <span style={styles.questionIcon}>📄</span>
                      <div style={styles.questionText}>{q.question}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ANSWER VIEW */}
          {currentView === "answer" && (
            <div style={styles.body}>
              <div style={styles.answerView}>
                <div style={styles.answerHeader}>
                  <div style={styles.answerCategory}>Find answers to common qu...</div>
                </div>
                <h2 style={styles.answerQuestion}>
                  {questions.find(q => q.id === selectedQuestion)?.question}
                </h2>
                <div style={styles.answerContent}>
                  {answers.map((a, i) => (
                    <div key={i} style={styles.answerSection}>
                      <p style={styles.answerText}>{a[2]}</p>
                    </div>
                  ))}
                </div>
                <div style={styles.feedbackSection}>
                  <p style={styles.feedbackQuestion}>Was this article useful?</p>
                  <div style={styles.feedbackButtons}>
                    <button
                      style={styles.feedbackBtn}
                      onClick={() => submitFeedback(true)}
                    >
                      <ThumbsUp size={20} />
                    </button>
                    <button
                      style={styles.feedbackBtn}
                      onClick={() => submitFeedback(false)}
                    >
                      <ThumbsDown size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* HELPDESK VIEW */}
          {currentView === "helpdesk" && (
            <div style={styles.body}>
              <div style={styles.helpdeskView}>
                <div style={styles.helpdeskHeader}>
                  <h3 style={styles.helpdeskHeaderText}>Submit Support Ticket</h3>
                </div>

                <div style={styles.contactForm}>
                  <input
                    style={styles.input}
                    name="fullName"
                    placeholder="Full Name *"
                    value={ticketData.fullName}
                    onChange={handleTicketChange}
                  />

                  <input
                    style={styles.input}
                    name="email"
                    type="email"
                    placeholder="Registered Email *"
                    value={ticketData.email}
                    onChange={handleTicketChange}
                  />

                  <input
                    style={styles.input}
                    name="course"
                    placeholder="Course"
                    value={ticketData.course}
                    onChange={handleTicketChange}
                  />

                  <input
                    style={styles.input}
                    name="queryType"
                    placeholder="Query Type"
                    value={ticketData.queryType}
                    onChange={handleTicketChange}
                  />

                  <input
                    style={styles.input}
                    name="subject"
                    placeholder="Your Query *"
                    value={ticketData.subject}
                    onChange={handleTicketChange}
                  />

                  <textarea
                    style={styles.textarea}
                    name="description"
                    placeholder="Describe your issue"
                    value={ticketData.description}
                    onChange={handleTicketChange}
                  />

                  <button style={styles.submitBtn} onClick={handleTicketSubmit}>
                    Submit Ticket
                  </button>

                  <button
                    style={styles.backToHomeBtn}
                    onClick={() => setCurrentView("welcome")}
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          
          )}
          {/* SUBMIT TICKET VIEW */}
          {currentView === "submitTicket" && (
            <div style={styles.body}>
              <div style={styles.helpdeskView}>
                <div style={styles.helpdeskHeader}>
                  <h3 style={styles.helpdeskHeaderText}>Submit Support Ticket</h3>
                </div>

                <div style={styles.contactForm}>
                  <input
                    style={styles.input}
                    name="fullName"
                    placeholder="Full Name *"
                    value={ticketData.fullName}
                    onChange={handleTicketChange}
                  />

                  <input
                    style={styles.input}
                    name="email"
                    type="email"
                    placeholder="Registered Email *"
                    value={ticketData.email}
                    onChange={handleTicketChange}
                  />

                  <input
                    style={styles.input}
                    name="course"
                    placeholder="Course"
                    value={ticketData.course}
                    onChange={handleTicketChange}
                  />

                  <input
                    style={styles.input}
                    name="queryType"
                    placeholder="Query Type"
                    value={ticketData.queryType}
                    onChange={handleTicketChange}
                  />

                  <input
                    style={styles.input}
                    name="subject"
                    placeholder="Your Query *"
                    value={ticketData.subject}
                    onChange={handleTicketChange}
                  />

                  <textarea
                    style={styles.textarea}
                    name="description"
                    placeholder="Describe your issue"
                    value={ticketData.description}
                    onChange={handleTicketChange}
                  />

                  <button style={styles.submitBtn} onClick={handleTicketSubmit}>
                    Submit Ticket
                  </button>

                  <button
                    style={styles.backToHomeBtn}
                    onClick={() => setCurrentView("welcome")}
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          )}


          {/* THANK YOU FEEDBACK VIEW */}
          {currentView === "thankYouFeedback" && (
            <div style={styles.body}>
              <div style={styles.feedbackView}>
                <div style={styles.feedbackSuccess}>

                  {/* 👍 LIKE CASE */}
                  {feedbackType === "like" && (
                    <>
                      <div style={styles.checkmark}>✓</div>
                      <h3 style={styles.thankYouText}>
                        Thank you for your Feedback!
                      </h3>
                      <p style={styles.feedbackMessage}>
                        We’re glad this information was helpful 😊
                      </p>

                      <button
                        style={styles.backToHomeBtn}
                        onClick={() => setCurrentView("welcome")}
                      >
                        Back to Home
                      </button>
                    </>
                  )}

                  {/* 👎 DISLIKE CASE */}
                  {feedbackType === "dislike" && (
                    <>
                      <div style={styles.ticketIcon}>✍️</div>
                      <h3 style={styles.thankYouText}>
                        Sorry this didn’t help
                      </h3>
                      <p style={styles.feedbackMessage}>
                        Please submit your query so we can assist you better.
                      </p>

                      <button
                        style={styles.messageUsBtn}
                        onClick={() => setCurrentView("submitTicket")}
                      >
                        Submit Your Query
                      </button>

                      <button
                        style={styles.backToHomeBtn}
                        onClick={() => setCurrentView("welcome")}
                      >
                        Back to Home
                      </button>
                    </>
                  )}

                </div>
              </div>
            </div>
          )}


          {/* TICKET MESSAGE VIEW */}
          {currentView === "ticketMessage" && (
            <div style={styles.body}>
              <div style={styles.feedbackView}>
                <div style={styles.feedbackSuccess}>
                  <div style={styles.ticketIcon}>🎫</div>
                  <h3 style={styles.thankYouText}>Need More Help?</h3>
                  <p style={styles.feedbackMessage}>
                    For detailed assistance, please submit a support ticket through our help portal.
                  </p>
                  <a
                    href={TICKET_FORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.ticketLink}
                  >
                    <button style={styles.messageUsBtn}>
                      🎫 Submit Support Ticket
                    </button>
                  </a>
                  <button
                    style={styles.backToHomeBtn}
                    onClick={() => setCurrentView("welcome")}
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

const styles = {
  chatIcon: {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #daadd0ff 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 9999,
    boxShadow: "0 8px 24px rgba(233, 232, 212, 0.25)",
    transition: "transform 0.2s",
  },
  chatbot: {
    position: "fixed",
    bottom: "95px",
    right: "24px",
    width: "400px",
    height: "600px",
    borderRadius: "16px",
    background: "#fff",
    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
    zIndex: 9999,
    overflow: "hidden",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    background: "linear-gradient(135deg, #dfabdaff 0%, #ebb4e3ff 100%)",
    color: "#fff",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: "70px",
  },
  backButton: {
    background: "transparent",
    border: "none",
    color: "white",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
  },
  logo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    lineHeight: "1",
  },
  logoLava: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#e40f3dff",
  },
  logolava: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#FFA500",
  },
  closeBtn: {
    background: "rgba(255,255,255,0.2)",
    border: "none",
    color: "white",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
  },
  body: {
    flex: 1,
    overflowY: "auto",
    background: "#f8f9fa",
  },
  welcomeView: {
    padding: "24px",
    background: "linear-gradient(180deg, #4a5dc9 0%, #4a5dc9 45%, #f8f9fa 45%)",
    minHeight: "100%",
  },
  welcomeTitle: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "white",
    margin: "0 0 8px 0",
  },
  welcomeSubtitle: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.9)",
    marginBottom: "32px",
  },
  chatSection: {
    background: "white",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  chatTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "12px",
  },
  helpdeskCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "8px",
    transition: "background 0.2s",
  },
  helpdeskIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "bold",
  },
  helpdeskName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
  },
  helpdeskStatus: {
    fontSize: "12px",
    color: "#666",
  },
  helpdeskTime: {
    fontSize: "11px",
    color: "#999",
    marginLeft: "auto",
  },
  faqSection: {
    background: "white",
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  faqHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  faqTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
  },
  faqCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    background: "#fff9e6",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  faqIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "#eea719ff",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "bold",
  },
  faqText: {
    fontSize: "13px",
    color: "#333",
    fontWeight: "500",
  },
  footerText: {
    textAlign: "center",
    fontSize: "12px",
    color: "#666",
    marginTop: "24px",
  },
  questionListView: {
    padding: "20px",
    minHeight: "100%",
  },
  categoryHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    background: "white",
    borderRadius: "12px",
    marginBottom: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  categoryIconSmall: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#FFA500",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "bold",
  },
  categoryLabel: {
    fontSize: "10px",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  categoryName: {
    fontSize: "14px",
    color: "#333",
    fontWeight: "600",
  },
  questionsList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  questionItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "14px",
    background: "white",
    borderRadius: "8px",
    cursor: "pointer",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  questionIcon: {
    fontSize: "16px",
    marginTop: "2px",
  },
  questionText: {
    fontSize: "13px",
    color: "#333",
    lineHeight: "1.5",
  },
  answerView: {
    padding: "20px",
    minHeight: "100%",
    background: "white",
  },
  answerHeader: {
    marginBottom: "16px",
  },
  answerCategory: {
    fontSize: "12px",
    color: "#666",
  },
  answerQuestion: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "20px",
    lineHeight: "1.4",
  },
  answerContent: {
    marginBottom: "24px",
  },
  answerSection: {
    marginBottom: "16px",
  },
  answerText: {
    fontSize: "14px",
    color: "#555",
    lineHeight: "1.6",
  },
  feedbackSection: {
    borderTop: "1px solid #e0e0e0",
    paddingTop: "20px",
    textAlign: "center",
  },
  feedbackQuestion: {
    fontSize: "14px",
    color: "#333",
    marginBottom: "12px",
    fontWeight: "500",
  },
  feedbackButtons: {
    display: "flex",
    justifyContent: "center",
    gap: "16px",
  },
  feedbackBtn: {
    background: "white",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    padding: "10px 16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },
  helpdeskView: {
    padding: "20px",
    minHeight: "100%",
    background: "white",
  },
  helpdeskHeader: {
    marginBottom: "20px",
  },
  helpdeskHeaderText: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
  },
  messageBox: {
    background: "#f0f4ff",
    padding: "16px",
    borderRadius: "12px",
    marginBottom: "24px",
  },
  messageText: {
    fontSize: "14px",
    color: "#555",
    lineHeight: "1.6",
    margin: 0,
  },
  contactForm: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "12px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  textarea: {
    padding: "12px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    minHeight: "100px",
    resize: "vertical",
    fontFamily: "inherit",
  },
  submitBtn: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "8px",
  },
  feedbackView: {
    padding: "40px 20px",
    minHeight: "100%",
    background: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  feedbackSuccess: {
    textAlign: "center",
  },
  checkmark: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "#f5a613ff",
    color: "white",
    fontSize: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  ticketIcon: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "#667eea",
    color: "white",
    fontSize: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  thankYouText: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "12px",
  },
  feedbackMessage: {
    fontSize: "14px",
    color: "#666",
    lineHeight: "1.6",
    marginBottom: "24px",
  },
  messageUsBtn: {
    background: "#4a5470ff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
    marginBottom: "12px",
  },
  backToHomeBtn: {
    background: "transparent",
    color: "#a1aadbff",
    border: "2px solid #dfe1ecff",
    borderRadius: "8px",
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
  },
  ticketLink: {
    textDecoration: "none",
    width: "100%",
  },
};

export default LavaSupportChatbot;