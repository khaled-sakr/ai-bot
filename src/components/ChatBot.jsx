import { GiReturnArrow } from "react-icons/gi";
import { Bounce } from "react-activity";
import "react-activity/dist/library.css";
import { TypeAnimation } from "react-type-animation";
import React, { useState } from "react";
import axios from "axios";
import { FiSend } from "react-icons/fi";
import "./ChatBot.css";
import AnimatedBackground from "./AnimatedBg";

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSimilarQuestions, setHasSimilarQuestions] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, sender: "user" }];
    setMessages(newMessages);
    setIsLoading(true);
    setInput("");

    try {
      const response = await axios.post(
        "https://unachatbot.onrender.com/ask_questions/",
        { question: input }
      );

      if (response.data) {
        const updatedMessages = newMessages.filter(
          (msg) => msg.text !== "Do you mean:"
        );

        if (
          response.data.similar_questions &&
          response.data.similar_questions.length > 0 &&
          !hasSimilarQuestions
        ) {
          updatedMessages.push({
            text: "هل تقصد:",
            sender: "bot",
            icon: "https://i.postimg.cc/YSzf3QQx/chatbot-1.png",
          });

          response.data.similar_questions.forEach((q) => {
            updatedMessages.push({
              text: q.question,
              sender: "bot",
              id: q.id,
              isButton: true,
            });
          });

          setHasSimilarQuestions(true);
        } else if (response.data.answer) {
          updatedMessages.push({
            text: response.data.answer,
            sender: "bot",
            icon: "https://i.postimg.cc/YSzf3QQx/chatbot-1.png",
            isHtml: true, // Mark as HTML for rendering
          });
        } else {
          updatedMessages.push({
            text: "آسف، لم أتمكن من العثور على الإجابة.",
            sender: "bot",
            icon: "https://i.postimg.cc/wB80F6Z9/chatbot.png",
          });
        }

        setMessages(updatedMessages);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: "حدث خطأ أثناء معالجة سؤالك. يرجى المحاولة مرة أخرى.",
          sender: "bot",
          icon: "https://i.postimg.cc/wB80F6Z9/chatbot.png",
        },
      ]);
    }

    setIsLoading(false);
  };

  const handleSimilarQuestion = async (id) => {
    const similarQuestion = messages.find((msg) => msg.id === id);
    if (!similarQuestion) return;

    setIsLoading(true);

    try {
      const response = await axios.post(
        "https://unachatbot.onrender.com/ask_questions/",
        { question: similarQuestion.text }
      );

      const newMessages = [
        ...messages,
        { text: similarQuestion.text, sender: "user" },
      ];

      if (response.data && response.data.answer) {
        newMessages.push({
          text: response.data.answer,
          sender: "bot",
          icon: "https://i.postimg.cc/YSzf3QQx/chatbot-1.png",
          isHtml: true, // Mark as HTML for rendering
        });
      } else {
        newMessages.push({
          text: "عذرًا، لم أتمكن من العثور على إجابة لهذا السؤال.",
          sender: "bot",
          icon: "https://i.postimg.cc/wB80F6Z9/chatbot.png",
        });
      }

      setMessages(newMessages);
    } catch (error) {
      console.error("حدث خطأ أثناء إرسال السؤال:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: "حدث خطأ أثناء معالجة سؤالك. يرجى المحاولة مرة أخرى.",
          sender: "bot",
          icon: "https://i.postimg.cc/wB80F6Z9/chatbot.png",
        },
      ]);
    }

    setIsLoading(false);
  };

  const startListening = () => {
    const recognition = new window.SpeechRecognition();

    recognition.onstart = () => {
      console.log("Voice recognition started. Speak into the microphone.");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      sendMessage(new Event("submit")); // Automatically send the message
    };

    recognition.onerror = (event) => {
      console.error("Error occurred in recognition: " + event.error);
    };

    recognition.start();
  };

  return (
    <AnimatedBackground>
      <div className="chat-page">
        <form onSubmit={sendMessage} className="chat-input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اكتب سؤالك هنا..."
            className="chat-input"
          />
          <button type="submit" className="send-button">
            <FiSend />
          </button>
          <button
            type="button"
            onMouseDown={startListening}
            className="microphone-button"
          >
            <img
              src="../microphone.png"
              alt="ميكروفون"
              style={{
                width: "27px",
                height: "27px",
              }}
            />
          </button>
        </form>
        <div className="chat-header">
          <h1>UNA BOT</h1>
          <p>مساعدك الشخصي بالذكاء الإصطناعي</p>
        </div>
        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.sender}`}>
                {msg.sender === "bot" && msg.icon && (
                  <img
                    src="../../robot1.png"
                    alt="روبوت"
                    className="message-avatar"
                  />
                )}
                <div className="message-text">
                  {false ? (
                    <div
                      style={{ fontFamily: "Tajawal, sans-serif" }}
                      className="message-text"
                    >
                      {msg.text}
                    </div>
                  ) : (
                    <TypeAnimation
                      sequence={[msg.text, () => setIsTypingComplete(true)]}
                      speed={70}
                      repeat={0}
                      wrapper="div"
                      cursor={!isTypingComplete}
                      render={() => {
                        if (msg.isHtml) {
                          return (
                            <div
                              dangerouslySetInnerHTML={{ __html: msg.text }}
                            />
                          );
                        } else {
                          return (
                            <div
                              style={{ fontFamily: "Tajawal, sans-serif" }}
                              className={`index-module_type__E-SaG message-text`}
                            >
                              {msg.text}
                            </div>
                          );
                        }
                      }}
                    />
                  )}
                </div>
                {msg.sender === "bot" && msg.isButton && (
                  <button
                    onClick={() => handleSimilarQuestion(msg.id)}
                    className="select-question-button"
                  >
                    <GiReturnArrow />
                  </button>
                )}
              </div>
            ))}
            {isLoading && (
              <Bounce
                style={{
                  color: "#129376",
                  margin: "auto",
                }}
              />
            )}
          </div>
        </div>
        <img src="../rob.png" alt="" className="robot-container" />
      </div>
    </AnimatedBackground>
  );
};

export default ChatPage;
