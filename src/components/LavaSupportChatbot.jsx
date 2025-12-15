import React, { useState, useEffect } from "react";
import { Search, ThumbsUp, ThumbsDown, ChevronLeft, X, MessageCircle } from "lucide-react";

const BASE_URL = "http://192.168.114.60:8082";

const LavaSupportChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState("welcome"); // welcome, categories, questionList, answer, helpdesk, feedback
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  /* ================= FETCH QUESTIONS ================= */
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
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  /* ================= FETCH ANSWERS ================= */
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

  /* ================= FEEDBACK ================= */
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
      setCurrentView("feedback");
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  /* ================= HANDLE FORM SUBMIT ================= */
  const handleFormSubmit = () => {
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill in all required fields");
      return;
    }
    // Here you can add API call to submit the form
    alert("Message sent successfully!");
    setFormData({ name: "", email: "", phone: "", message: "" });
    setCurrentView("welcome");
  };

  useEffect(() => {
    if (isOpen && currentView === "questionList") {
      fetchQuestions();
    }
  }, [isOpen, currentView]);

  const filteredQuestions = questions.filter(q =>
    q.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBack = () => {
    if (currentView === "answer" || currentView === "helpdesk") {
      setCurrentView("questionList");
      setSelectedQuestion(null);
      setAnswers([]);
    } else if (currentView === "questionList") {
      setCurrentView("categories");
      setSearchQuery("");
    } else if (currentView === "categories") {
      setCurrentView("welcome");
    } else if (currentView === "feedback") {
      setCurrentView("welcome");
    }
  };

  return (
    <>
      {/* CHATBOT ICON */}
      <div style={styles.chatIcon} onClick={() => setIsOpen(true)}>
        <MessageCircle size={28} color="white" />
      </div>

      {/* CHATBOT WINDOW */}
      {isOpen && (
        <div style={styles.chatbot}>
          {/* HEADER */}
          <div style={styles.header}>
            {currentView !== "welcome" && (
              <button style={styles.backButton} onClick={handleBack}>
                <ChevronLeft size={20} />
              </button>
            )}
            <div style={styles.headerContent}>
              <div style={styles.logo}>
                <span style={styles.logoLava}>Lava</span>
                
              </div>
            </div>
            <button style={styles.closeBtn} onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* BODY */}
          <div style={styles.body}>
            {/* WELCOME VIEW */}
            {currentView === "welcome" && (
              <div style={styles.welcomeView}>
                <h2 style={styles.welcomeTitle}>Hello there!</h2>
                <p style={styles.welcomeSubtitle}>Welcome to Lava</p>

                <div style={styles.chatSection}>
                  <h3 style={styles.chatTitle}>Chat with us</h3>
                  <div style={styles.helpdeskCard} onClick={() => setCurrentView("helpdesk")}>
                    <div style={styles.helpdeskIcon}>A</div>
                    <div>
                      <div style={styles.helpdeskName}>Lava Helpdesk</div>
                      <div style={styles.helpdeskStatus}>👋 hi</div>
                    </div>
                    <div style={styles.helpdeskTime}>3:14 PM</div>
                  </div>
                </div>

                <div style={styles.faqSection}>
                  <div style={styles.faqHeader}>
                    <span style={styles.faqTitle}>Frequently Asked Questions</span>
                    <Search 
                      size={20} 
                      style={styles.searchIcon}
                      onClick={() => setCurrentView("categories")}
                    />
                  </div>
                  <div style={styles.faqCard} onClick={() => setCurrentView("categories")}>
                    <div style={styles.faqIcon}>F</div>
                    <span style={styles.faqText}>Find answers to common questions</span>
                  </div>
                </div>

                <p style={styles.footerText}>Welcome to LAVA Support</p>
              </div>
            )}

            {/* CATEGORIES VIEW */}
            {currentView === "categories" && (
              <div style={styles.categoriesView}>
                <div style={styles.searchBar}>
                  <Search size={18} style={styles.searchIconInline} />
                  <input
                    type="text"
                    placeholder="Search for Answers"
                    style={styles.searchInput}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <h3 style={styles.categoriesTitle}>Categories</h3>
                <div style={styles.categoryCard} onClick={() => {
                  setCurrentView("questionList");
                  fetchQuestions();
                }}>
                  <div style={styles.categoryIcon}>F</div>
                  <span style={styles.categoryText}>Find answers to common questions</span>
                </div>
              </div>
            )}

            {/* QUESTION LIST VIEW */}
            {currentView === "questionList" && (
              <div style={styles.questionListView}>
                <div style={styles.searchBar}>
                  <Search size={18} style={styles.searchIconInline} />
                  <input
                    type="text"
                    placeholder="Search for Answers"
                    style={styles.searchInput}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div style={styles.categoryHeader}>
                  <div style={styles.categoryIconSmall}>F</div>
                  <div>
                    <div style={styles.categoryLabel}>CATEGORY</div>
                    <div style={styles.categoryName}>Find answers to common questions</div>
                  </div>
                </div>

                <div style={styles.questionsList}>
                  {filteredQuestions.map(q => (
                    <div
                      key={q.id}
                      style={styles.questionItem}
                      onClick={() => fetchAnswers(q.id)}
                    >
                      <div style={styles.questionIcon}>📄</div>
                      <span style={styles.questionText}>{q.question}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ANSWER VIEW */}
            {currentView === "answer" && (
              <div style={styles.answerView}>
                <div style={styles.answerHeader}>
                  <span style={styles.answerCategory}>Find answers to common qu...</span>
                </div>
                
                <h3 style={styles.answerQuestion}>
                  {questions.find(q => q.id === selectedQuestion)?.question}
                </h3>

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
            )}

            {/* HELPDESK VIEW */}
            {currentView === "helpdesk" && (
              <div style={styles.helpdeskView}>
                <div style={styles.helpdeskHeader}>
                  <span style={styles.helpdeskHeaderText}>Lava Helpdesk</span>
                </div>

                <div style={styles.messageBox}>
                  <p style={styles.messageText}>
                    Hi! How can we help you today? Please fill out the form below and we'll get back to you shortly.
                  </p>
                </div>

                <div style={styles.contactForm}>
                  <input
                    type="text"
                    placeholder="Your Name *"
                    style={styles.input}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                  <input
                    type="email"
                    placeholder="Your Email *"
                    style={styles.input}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    style={styles.input}
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                  <textarea
                    placeholder="Your Message *"
                    style={styles.textarea}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                  <button style={styles.submitBtn} onClick={handleFormSubmit}>
                    Send Message
                  </button>
                </div>
              </div>
            )}

            {/* FEEDBACK VIEW */}
            {currentView === "feedback" && (
              <div style={styles.feedbackView}>
                <div style={styles.feedbackSuccess}>
                  <div style={styles.checkmark}>✓</div>
                  <h3 style={styles.thankYouText}>Thank you for your Feedback!</h3>
                  <p style={styles.feedbackMessage}>
                    We appreciate your input and will use it to improve our service.
                  </p>
                  <button 
                    style={styles.messageUsBtn}
                    onClick={() => setCurrentView("helpdesk")}
                  >
                    💬 Message Us
                  </button>
                  <button 
                    style={styles.backToHomeBtn}
                    onClick={() => setCurrentView("welcome")}
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

/* ================= STYLES ================= */
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
    boxShadow: "0 8px 24px rgba(236, 141, 240, 0.4)",
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
  logoApna: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#FFA500",
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
  searchIcon: {
    color: "#666",
    cursor: "pointer",
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
    background: "#FFA500",
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
  categoriesView: {
    padding: "20px",
    minHeight: "100%",
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    background: "white",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "10px 12px",
    marginBottom: "24px",
  },
  searchIconInline: {
    color: "#999",
    marginRight: "8px",
  },
  searchInput: {
    border: "none",
    outline: "none",
    flex: 1,
    fontSize: "14px",
    color: "#333",
  },
  categoriesTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "16px",
  },
  categoryCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    background: "white",
    borderRadius: "12px",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    transition: "transform 0.2s",
  },
  categoryIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "#FFA500",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "bold",
  },
  categoryText: {
    fontSize: "14px",
    color: "#333",
    fontWeight: "500",
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
    background: "#4CAF50",
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
    background: "#4a5dc9",
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
    color: "#4a5dc9",
    border: "2px solid #4a5dc9",
    borderRadius: "8px",
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
  },
};

export default LavaSupportChatbot;