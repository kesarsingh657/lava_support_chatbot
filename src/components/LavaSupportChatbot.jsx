import React, { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, ChevronLeft, X, MessageCircle } from "lucide-react";

const BASE_URL = "http://192.168.114.60:8082";
const OTHER_QUESTION_ID = 0;



const CATEGORIES = {
  power: {
    id: "power",
    name: "Power & Battery",
    keywords: ["charging", "battery", "power", "switch", "switching"]
  },
  performance: {
    id: "performance",
    name: "Performance Issues",
    keywords: ["hanging", "freezing", "slow", "overheating", "heating"]
  },
  network: {
    id: "network",
    name: "Network & Internet",

    keywords: ["internet", "network", "sim", "wifi", "hotspot", "data"]
  },
  apps: {
    id: "apps",
    name: "Apps & Software",

    keywords: ["app", "application", "whatsapp", "facebook", "notification", "play store"]
  },
  settings: {
    id: "settings",
    name: "Settings & Features",

    keywords: ["talkback", "call recording", "fingerprint", "applock", "anti-theft", "screen cast", "assistant", "edge light"]
  },
  // other: {
  //   id: "other",
  //   name: "Other",

  //   keywords: ["other"]
  // }
};

const LavaSupportChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState("welcome");
  const [questions, setQuestions] = useState([]);
  const [categorizedQuestions, setCategorizedQuestions] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [feedbackType, setFeedbackType] = useState(null);
  const [errors, setErrors] = useState({});
  const [generatedTicketNo, setGeneratedTicketNo] = useState(null);
  const [ticketData, setTicketData] = useState({
    fullName: "",
    email: "",
    phone: "",
    queryText: ""
  });
  const [visibleQuestions, setVisibleQuestions] = useState([]);
  const [ticketNo, setTicketNo] = useState();


  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\d{10}$/.test(phone);

  const categorizeQuestion = (question) => {
    const questionLower = question.toLowerCase();

    for (const [key, category] of Object.entries(CATEGORIES)) {
      if (category.keywords.some(keyword => questionLower.includes(keyword))) {
        return key;
      }
    }

    return "settings";
  };

  const fetchQuestions = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/chatbot/questions`);
      const data = await res.json();
      const formattedData = data.map(item => ({
        id: item[0],
        question: item[1],
        createdAt: item[2],
        category: categorizeQuestion(item[1])
      }));

      setQuestions(formattedData);

      // Group questions by category
      const grouped = formattedData.reduce((acc, q) => {
        if (!acc[q.category]) {
          acc[q.category] = [];
        }
        acc[q.category].push(q);
        return acc;
      }, {});

      setCategorizedQuestions(grouped);
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
    if (!wasHelpful) {
      setFeedbackType("dislike");
      setCurrentView("thankYouFeedback");
      return;
    }


    try {
      await fetch(`${BASE_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({         /* finalchnge at 13.12 */
          questionId: selectedQuestion ?? OTHER_QUESTION_ID,
          wasHelpful: true,
          contactNumber: null,
          email: null,
          queryText: null,
          ticket_no: null,
          created_by: null,
          updated_by: null,
        }),
      });

      setFeedbackType("like");
      setCurrentView("thankYouFeedback");
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };
  const handleTicketChange = (e) => {
    const { name, value } = e.target;
    let newErrors = { ...errors };

    if (name === "email") {
      if (!value) newErrors.email = "Email is required";
      else if (!validateEmail(value)) newErrors.email = "Enter a valid email";
      else delete newErrors.email;
    }

    if (name === "phone") {
      if (value && !validatePhone(value))
        newErrors.phone = "Enter valid 10-digit phone number";
      else delete newErrors.phone;
    }

    if (name === "fullName") {
      if (!value.trim()) newErrors.fullName = "Full name is required";
      else delete newErrors.fullName;
    }

    if (name === "queryText") {
      if (!value.trim()) newErrors.queryText = "Query is required";
      else if (value.length > 250)
        newErrors.queryText = "Max 250 characters allowed";
      else delete newErrors.queryText;
    }

    setErrors(newErrors);
    setTicketData({ ...ticketData, [name]: value });
  };

  const handleTicketSubmit = async () => {
    let newErrors = {};

    if (!ticketData.fullName.trim())
      newErrors.fullName = "Full name is required";

    if (!ticketData.email)
      newErrors.email = "Email is required";
    else if (!validateEmail(ticketData.email))
      newErrors.email = "Enter a valid email";

    if (ticketData.phone && !validatePhone(ticketData.phone))
      newErrors.phone = "Enter valid 10-digit phone number";

    if (!ticketData.queryText.trim())
      newErrors.queryText = "Query is required";
    else if (ticketData.queryText.length > 250)
      newErrors.queryText = "Max 250 characters allowed";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    ticketData.wasHelpful = false;

    try {
      const res = await fetch(`${BASE_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: selectedQuestion ?? OTHER_QUESTION_ID,
          wasHelpful: false,
          contactNumber: ticketData.phone || null,
          email: ticketData.email || null,
          queryText: ticketData.queryText || null,
          ticket_no: null,
          created_by: ticketData.fullName || null,
          updated_by: null,
        })
      });

      const data = await res.json();
      setTicketNo(data.ticket);
      setGeneratedTicketNo(data.ticketNo || "TKT-" + Date.now());
      setCurrentView("ticketSuccess");
      setTicketData({
        fullName: "",
        email: "",
        phone: "",
        queryText: ""
      });
      setErrors({});
    } catch (error) {
      console.error("Ticket submit error:", error);
      alert("Failed to submit ticket. Please try again.");
    }
  };

  useEffect(() => {
    if (isOpen && currentView === "categoryList") {
      fetchQuestions();
    }
  }, [isOpen, currentView]);

  const handleBack = () => {
    if (currentView === "answer") {
      setCurrentView("questionList");
      setSelectedQuestion(null);
      setAnswers([]);
    }
    else if (currentView === "questionList") {
      setCurrentView("categoryList");
      setSelectedCategory(null);
    }
    else if (currentView === "categoryList") {
      setCurrentView("welcome");
    }
    else if (currentView === "submitTicket" || currentView === "thankYouFeedback" || currentView === "ticketSuccess") {
      setCurrentView("welcome");
      setGeneratedTicketNo(null);
      setFeedbackType(null);
      setSelectedQuestion(null);
      setAnswers([]);
      setTicketData({
        fullName: "",
        email: "",
        phone: "",
        queryText: ""
      });
      setErrors({});
    }
  };
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentView("questionList");

    // Animate questions
    const categoryQuestions = categorizedQuestions[categoryId] || [];
    setVisibleQuestions([]);
    categoryQuestions.forEach((_, index) => {
      setTimeout(() => {
        setVisibleQuestions(prev => [...prev, index]);
      }, index * 150);
    });
  };


  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
    @keyframes slideInUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <>
      <div style={styles.chatIcon} onClick={() => setIsOpen(true)}>
        <MessageCircle size={28} color="white" />
      </div>

      {isOpen && (
        <div style={styles.chatbot}>
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
                <p style={styles.welcomeSubtitle}></p>

                <div style={styles.faqSection}>
                  {/* <div style={styles.faqHeader}>
                    <p style={styles.faqTitle}>How can i help you ?</p>
                  </div> */}
                  <div
                    style={styles.faqCard}
                    onClick={() => {
                      setCurrentView("categoryList");
                      fetchQuestions();
                    }}
                  >
                    <div style={styles.faqIcon}>?</div>
                    <div style={styles.faqText}>How can i help you</div>
                  </div>
                </div>

                <div style={{ marginTop: "200px" }}>
                  <p style={styles.footerText}>Welcome to LAVA Support</p>
                </div>
              </div>
            </div>
          )}

          {currentView === "categoryList" && (
            <div style={styles.body}>
              <div style={styles.categoryListView}>
                <div style={styles.faqHeaderSection}>
                  <h2 style={styles.faqMainTitle}>How can i help you ?</h2>
                  <div style={styles.searchIconContainer}>🔍</div>
                </div>
                <h2 style={styles.categoryListTitle}>Select a Category</h2>
                <div style={styles.categoriesGrid}>
                  {Object.entries(CATEGORIES).map(([key, category], idx) => {
                    const count = (categorizedQuestions[key] || []).length;

                    // allow "other" even if count = 0
                    if (count === 0 && key !== "other") return null;

                    return (
                      <div
                        key={key}
                        style={{
                          ...styles.categoryBubble,
                          animationDelay: `${idx * 0.15}s`
                        }}
                        onClick={() => {
                          if (key === "other") {
                            setFeedbackType("dislike");
                            setCurrentView("thankYouFeedback");
                          } else {
                            handleCategorySelect(key);
                          }
                        }}
                      >
                        <div style={styles.categoryBubbleContent}>
                          <span style={styles.categoryBubbleText}>
                            {category.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* OTHER CATEGORY */}
                  <div
                    style={{
                      ...styles.categoryBubble,
                      opacity: 1,                 // 🔥 IMPORTANT
                      transform: "translateY(0)", // 🔥 IMPORTANT
                      animation: "none"            // 🔥 IMPORTANT
                    }}
                    onClick={() => {
                      setSelectedQuestion(OTHER_QUESTION_ID);
                      setFeedbackType("dislike");
                      setCurrentView("thankYouFeedback");
                    }}
                  >
                    <div style={styles.categoryBubbleContent}>
                      <span style={styles.categoryBubbleText}>Other</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {currentView === "questionList" && selectedCategory && (
            <div style={styles.body}>
              <div style={styles.questionListView}>
                <div style={styles.categoryHeader}>
                  <div style={styles.categoryIconSmall}>
                    {CATEGORIES[selectedCategory].icon}
                  </div>
                  <div>
                    <div style={styles.categoryName}>
                      {CATEGORIES[selectedCategory].name}
                    </div>
                  </div>
                </div>

                <div style={styles.questionsList}>
                  {(categorizedQuestions[selectedCategory] || []).map((q, index) => (
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

          {currentView === "answer" && (
            <div style={styles.body}>
              <div style={styles.answerViewWrapper}>
                <div style={styles.answerScrollable}>
                  <div style={styles.answerHeader}>
                    <div style={styles.answerCategory}>
                      {selectedCategory && CATEGORIES[selectedCategory].name}
                    </div>
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
                </div>
                <div style={styles.feedbackSectionFixed}>
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
          {currentView === "thankYouFeedback" && (
            <div style={styles.body}>
              <div style={styles.feedbackView}>
                <div style={styles.feedbackSuccess}>
                  {feedbackType === "like" && (
                    <>
                      <div style={styles.checkmark}>✓</div>
                      <h3 style={styles.thankYouText}>
                        Thank you for your Feedback!
                      </h3>
                      <p style={styles.feedbackMessage}>
                        We're glad this information was helpful 😊
                      </p>

                      <button
                        style={styles.backToHomeBtn}
                        onClick={() => setCurrentView("welcome")}
                      >
                        Back to Home
                      </button>
                    </>
                  )}

                  {feedbackType === "dislike" && (
                    <>
                      <h3 style={styles.thankYouText}>
                        Sorry this didn't help
                      </h3>
                      <p style={styles.feedbackMessage}>
                        We appreciate your feedback. Please submit your query below so we can assist you better.
                      </p>

                      <div style={styles.contactForm}>
                        <input
                          style={errors.fullName ? styles.inputError : styles.input}
                          name="fullName"
                          placeholder="Full Name *"
                          value={ticketData.fullName}
                          onChange={handleTicketChange}
                        />
                        {errors.fullName && <div style={styles.errorText}>{errors.fullName}</div>}

                        <input
                          style={errors.email ? styles.inputError : styles.input}
                          name="email"
                          type="email"
                          placeholder="Registered Email *"
                          value={ticketData.email}
                          onChange={handleTicketChange}
                        />
                        {errors.email && <div style={styles.errorText}>{errors.email}</div>}

                        <input
                          style={errors.phone ? styles.inputError : styles.input}
                          name="phone"
                          placeholder="Phone Number"
                          value={ticketData.phone}
                          onChange={handleTicketChange}
                        />
                        {errors.phone && <div style={styles.errorText}>{errors.phone}</div>}

                        <textarea
                          style={errors.queryText ? styles.textareaError : styles.textarea}
                          name="queryText"
                          placeholder="Describe your issue *"
                          value={ticketData.queryText}
                          onChange={handleTicketChange}
                        />
                        {errors.queryText && <div style={styles.errorText}>{errors.queryText}</div>}
                        <button style={styles.submitBtn} onClick={handleTicketSubmit}>
                          Submit Ticket
                        </button>

                        <button
                          style={styles.backToHomeBtn}
                          onClick={() => {
                            setCurrentView("welcome");
                            setGeneratedTicketNo(null);
                            setFeedbackType(null);
                            setSelectedQuestion(null);
                            setAnswers([]);
                          }}
                        >
                          Back to Home
                        </button>


                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentView === "ticketSuccess" && (
            <div style={styles.body}>
              <div style={styles.feedbackView}>
                <div style={styles.feedbackSuccess}>
                  <div style={styles.checkmark}>✓</div>
                  <h3 style={styles.thankYouText}>
                    Ticket No : {ticketNo}
                  </h3>
                  <span>
                    Our Care agent will connect with you shortly
                  </span>
                  <button
                    style={styles.backToHomeBtn}
                    onClick={() => {
                      setCurrentView("welcome");
                      setGeneratedTicketNo(null);
                      setFeedbackType(null);
                      setSelectedQuestion(null);
                      setAnswers([]);
                      setTicketData({
                        fullName: "",
                        email: "",
                        phone: "",
                        queryText: ""
                      });
                      setErrors({});
                    }}
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
    background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 9999,
    boxShadow: "0 8px 24px rgba(33, 150, 243, 0.25)",
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
    background: "linear-gradient(135deg, #2196F3 0%, #42A5F5 100%)",
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
  logolava: {
    fontSize: "22px",
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: "1px",
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
    background: "linear-gradient(180deg, #1976D2 0%, #1976D2 45%, #f8f9fa 45%)",
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
    background: "#E3F2FD",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  faqIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "#2196F3",
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
    marginTop: "40px",
    fontWeight: "bold",
  },
  categoryListView: {
    padding: "20px",
    minHeight: "100%",
  },
  categoryListTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "16px",
  },
  categoriesGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  categoryName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "4px",
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
    background: "#E3F2FD",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
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
    whiteSpace: "pre-wrap",
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
  contactForm: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    flex: 1,
  },
  input: {
    padding: "10px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  inputError: {
    padding: "10px",
    border: "2px solid #f44336",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  textarea: {
    padding: "10px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    minHeight: "70px",
    resize: "vertical",
    fontFamily: "inherit",
  },
  textareaError: {
    padding: "10px",
    border: "2px solid #f44336",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    minHeight: "70px",
    resize: "vertical",
    fontFamily: "inherit",
  },
  errorText: {
    color: "#f44336",
    fontSize: "12px",
    marginTop: "-8px",
    marginBottom: "4px",
  },
  submitBtn: {
    background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "4px",
  },
  feedbackView: {
    padding: "20px",
    minHeight: "100%",
    background: "white",
    display: "flex",
    flexDirection: "column",
  },
  feedbackSuccess: {
    textAlign: "center",
    flex: 1,
    display: "flex",
    flexDirection: "column",
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
    fontSize: "18px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "8px",
  },
  feedbackMessage: {
    fontSize: "13px",
    color: "#666",
    lineHeight: "1.5",
    marginBottom: "16px",
  },
  backToHomeBtn: {
    background: "transparent",
    color: "#2196F3",
    border: "2px solid #2196F3",
    borderRadius: "8px",
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
    marginTop: "10px"
  },
  faqHeaderSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
    padding: "12px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  faqMainTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#2196F3",
    margin: 0,
  },
  searchIconContainer: {
    fontSize: "18px",
  },
  categoryBubble: {
    background: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
    borderRadius: "20px",
    padding: "16px 20px",
    cursor: "pointer",
    boxShadow: "0 3px 10px rgba(33, 150, 243, 0.15)",
    transition: "all 0.3s ease",
    animation: "slideInUp 0.5s ease forwards",
    opacity: 0,
    transform: "translateY(20px)",
  },
  categoryBubbleContent: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  categoryEmoji: {
    fontSize: "24px",
  },
  categoryBubbleText: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1976D2",
    flex: 1,
  },
  answerViewWrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    background: "white",
  },
  answerScrollable: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    paddingBottom: "10px",
  },
  feedbackSectionFixed: {
    borderTop: "1px solid #e0e0e0",
    padding: "16px 20px",
    background: "white",
    textAlign: "center",
  },


};

export default LavaSupportChatbot;