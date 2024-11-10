import { AnimatePresence, motion } from "framer-motion";
import { init } from "@instantdb/react";
import { useState, useRef, useEffect } from "react";
const APP_ID = "d8419df9-903c-4b0a-b501-534596976600";
import Widget from "./Widget";
const db = init({ appId: APP_ID });

import { Noto_Color_Emoji } from "next/font/google";
import { Ubuntu } from "next/font/google";

const notoColorEmoji = Noto_Color_Emoji({
  weight: "400",
  subsets: ["emoji"],
});

const ubuntu = Ubuntu({
  weight: "400",
  subsets: ["latin"],
});

import { getChatCompletion } from "@/actions/openai";
import { getTextToSpeech } from "@/actions/elevenlabs";
import { CurvedBackground } from "./CurvedBackground";
import { CurvedBackground2 } from "./CurvedBackground2";

const iconToImageUrl = (icon: string) => {
  switch (icon) {
    case "🧺":
      return "/icons/laundry.png";
    case "🏃":
      return "/icons/stretch.png";
    case "🏙️":
      return "/icons/city.png";
    case "🪥":
      return "/icons/toothbrush.png";
  }
};

interface Task {
  id: number;
  title: string;
  icon: string;
  done: boolean;
}

interface GoalExpandedProps {
  task: Task;
  onClose: () => void;
  layoutId: string;
  onMarkDone: () => void;
  onMarkNotDone: () => void;
  onFinish: () => void;
}

interface CelebrationModalProps {
  task: Task;
  onClose: () => void;
  onFinish: () => void;
}

function CelebrationModal({ task, onClose, onFinish }: CelebrationModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={() => {
        onClose();
        onFinish();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <span className={`text-6xl ${notoColorEmoji.className}`}>🎉</span>
        <h2 className="text-2xl font-bold mt-4 mb-2">Amazing job!</h2>
        <p
          className={`text-gray-600 mb-4 ${notoColorEmoji.className} ${ubuntu.className}`}
        >
          You completed &quot;{task.title}&quot; and earned 50 coins! 🌟
        </p>
        <button
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
          onClick={() => {
            onClose();
            onFinish();
          }}
        >
          Keep going!
        </button>
      </motion.div>
    </motion.div>
  );
}

// Add this new component for the flying coin animation
function FlyingCoin({
  startPosition,
  endPosition,
  onComplete,
}: {
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  onComplete: () => void;
}) {
  return (
    <motion.div
      initial={{
        x: startPosition.x,
        y: startPosition.y,
        scale: 1,
        opacity: 1,
      }}
      animate={{
        x: endPosition.x,
        y: endPosition.y,
        scale: 0.5,
        opacity: 0,
      }}
      transition={{
        type: "spring",
        damping: 12,
        stiffness: 100,
        mass: 0.5,
        opacity: {
          times: [1, 1, 0], // Stay fully visible until the end, then quickly fade
          duration: 0.33, // Shorter duration for a quicker fade
        },
      }}
      onAnimationComplete={onComplete}
      className="fixed z-[100] text-2xl pointer-events-none"
    >
      🪙
    </motion.div>
  );
}

export function GoalExpanded({
  task,
  onClose,
  onMarkDone,
  layoutId,
  onMarkNotDone,
  onFinish,
}: GoalExpandedProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [flyingCoins, setFlyingCoins] = useState<
    { id: number; startPos: { x: number; y: number } }[]
  >([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [widgetMessage, setWidgetMessage] = useState<string>("");
  const timerDuration = getTaskTimer(task);

  // Fetch message when component mounts
  useEffect(() => {
    const fetchMessage = async () => {
      const message = await getWidgetMessage(task);
      setWidgetMessage(message);
    };
    fetchMessage();
  }, [task]);

  const handleMarkDone = () => {
    // Get button position
    const button = buttonRef.current;
    if (button) {
      const rect = button.getBoundingClientRect();
      const startPos = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };

      // Add 3 coins with slightly different positions
      setFlyingCoins([
        { id: Date.now(), startPos: { x: startPos.x - 20, y: startPos.y } },
        { id: Date.now() + 1, startPos },
        { id: Date.now() + 2, startPos: { x: startPos.x + 20, y: startPos.y } },
      ]);
    }

    onMarkDone();
    // setShowCelebration(true);
    setTimeout(() => {
      onClose();
      onFinish();
    }, 500);
  };

  return (
    <>
      {/* Add flying coins */}
      {flyingCoins.map((coin) => (
        <FlyingCoin
          key={coin.id}
          startPosition={coin.startPos}
          endPosition={{ x: 40, y: 40 }} // Position of the coin counter
          onComplete={() => {
            setFlyingCoins((current) =>
              current.filter((c) => c.id !== coin.id)
            );
          }}
        />
      ))}

      <div
        className="fixed inset-0 z-10 flex items-start justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          layoutId={layoutId}
          className="bg-white w-full max-w-lg rounded-xl shadow-lg mt-[40vh]"
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 400,
            duration: 0.2,
          }}
        >
          {/* Task header */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              {iconToImageUrl(task.icon) ? (
                <img
                  src={iconToImageUrl(task.icon)}
                  alt={task.icon}
                  className="w-10 h-10"
                />
              ) : (
                <div
                  className={`w-10 h-10 flex items-center justify-center text-4xl ${notoColorEmoji.className}`}
                >
                  {task.icon}
                </div>
              )}
              <span className="text-xl">{task.title}</span>
            </div>
            <div className="check-button-base p-2 px-4">
              <span
                className={`${
                  task.done
                    ? "text-green-500 opacity-100"
                    : "text-gray-500 opacity-50"
                } font-extrabold text-xl`}
              >
                ✓
              </span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="px-4 pb-4"
          >
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Task Details</h3>

              {/* Widget's message in task details */}
              <div className="bg-blue-50 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src="/character/idle.gif"
                    alt="Widget"
                    className="w-12 h-12"
                  />
                  {widgetMessage ? (
                    <p className="text-gray-700 italic">{widgetMessage}</p>
                  ) : (
                    <div className="animate-pulse h-6 w-48 bg-gray-200 rounded"></div>
                  )}
                </div>
              </div>

              {/* Add timer if task requires it */}
              {timerDuration && (
                <TaskTimer
                  seconds={timerDuration}
                  onComplete={() => {
                    // Optionally auto-mark as done when timer completes
                    // if (!task.done) {
                    //   handleMarkDone();
                    // }
                  }}
                />
              )}

              {/* Mark as done button */}
              {!task.done ? (
                <button
                  ref={buttonRef}
                  className="w-full bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 text-white text-lg font-semibold flex items-center justify-center gap-2"
                  onClick={handleMarkDone}
                >
                  <span>Mark as done</span>
                  <span className="text-xl">🪙</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    onMarkNotDone();
                    onClose();
                  }}
                  className="w-full bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"
                >
                  Mark as not done
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showCelebration && (
          <CelebrationModal
            task={task}
            onClose={() => {
              setShowCelebration(false);
              onClose();
            }}
            onFinish={() => {
              onFinish();
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "widget";
  relevantTasks?: number[];
}

function ChatTaskCard({
  task,
  onSelectTask,
}: {
  task: Task;
  onSelectTask: (taskId: number) => void;
}) {
  return (
    <div
      className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:bg-gray-50"
      onClick={() => {
        onSelectTask(task.id);
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {iconToImageUrl(task.icon) ? (
            <img
              src={iconToImageUrl(task.icon)}
              alt={task.icon}
              className="w-10 h-10"
            />
          ) : (
            <div
              className={`w-10 h-10 flex items-center justify-center text-4xl ${notoColorEmoji.className}`}
            >
              {task.icon}
            </div>
          )}
          <span className="text-xl">{task.title}</span>
        </div>
        <div className="check-button-base p-2 px-4">
          <span
            className={`${
              task.done
                ? "text-green-500 opacity-100"
                : "text-gray-500 opacity-50"
            } font-extrabold text-xl`}
          >
            ✓
          </span>
        </div>
      </div>
    </div>
  );
}

interface ChatScreenProps {
  onClose: () => void;
  goals: Task[];
  onSelectTask: (taskId: number) => void;
  onAddTask: (title: string) => Promise<number | void>;
}

function ChatScreen({
  onClose,
  goals,
  onSelectTask,
  onAddTask,
}: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm Widget, and i'm here to help motivate you to do your goals!",
      sender: "widget",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  // @ts-ignore
  const recognitionRef = useRef<any>(null); // Store recognition instance

  // @ts-ignore
  const scrollToBottom = () => {
    // @ts-ignore
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    // Create context from previous messages
    const lastMessages = messages.slice(-4);
    const conversationContext = lastMessages
      .map((msg) => `${msg.sender === "user" ? "User" : ""}: ${msg.text}`)
      .join("\n");

    // Create the prompt with additional context about task creation
    const fullPrompt = `You are Widget, a friendly and enthusiastic alien who helps humans with their tasks. You're cute, supportive, and love celebrating their achievements.

Current tasks:
${goals
  .map(
    (goal) =>
      `${goal.id}. ${goal.title} (${
        goal.done ? "completed" : "not completed yet"
      })`
  )
  .join("\n")}

IMPORTANT INSTRUCTIONS:
If user wants to create a task, respond with a fun message one sentence max, and end it with "CREATE_NEW_TASK:Task Title"
If user asks about existing tasks, respond with a fun message, and end it with "RELEVANT_TASKS:1,2,3"

If you are suggesting relevent tasks without context, showcase the ones that aren't done yet.

Only use ONE format, never both in the same response. Default to showing relevent tasks, do not creat a new task unless it makes sense and you have a specific task and title to create.

DO NOT EVER MAKE A TASK UNLESS YOU HAVE A SPECIFIC TITLE FOR IT, NO GENERIC TITLES, ASK FOLLOW UP QUESTIONS IF YOU ARE NOT SURE WHAT THE USER WANTS TO CREATE. NEVER MAKE ONE CALLED "task title" or "new task title" or anything like that. IF YOU ARE ASKING A FOLLOW UP, NO NEED TO SHOW RELEVANT TASKS. Use proper capitalization on this part.

Your message should be short and concise, one sentence max! No longer!

Recent conversation:
${conversationContext}

User: ${inputText}`;

    const response = await getChatCompletion(fullPrompt);
    if (response) {
      let messageText = response;
      let relevantTaskIds: number[] = [];

      // Check for markers
      const taskMarker = response.match(/RELEVANT_TASKS:([0-9,\s]+)/);
      const createTaskMarker = response.match(/CREATE_NEW_TASK:(.+)$/);

      if (createTaskMarker) {
        const newTaskTitle = createTaskMarker[1].trim();
        const newTaskId = await onAddTask(newTaskTitle);
        if (newTaskId !== undefined) {
          messageText = messageText.replace(/CREATE_NEW_TASK:.+$/, "").trim();
          const confirmMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: messageText,
            sender: "widget",
            relevantTasks: [newTaskId],
          };
          setMessages((prev) => [...prev, confirmMessage]);
        }
      } else if (taskMarker) {
        messageText = messageText
          .replace(/RELEVANT_TASKS:[0-9,\s]+/, "")
          .trim();
        relevantTaskIds = taskMarker[1]
          .split(",")
          .map((num) => num.trim())
          .filter(Boolean)
          .map(Number);

        const widgetMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: messageText,
          sender: "widget",
          relevantTasks: relevantTaskIds,
        };
        setMessages((prev) => [...prev, widgetMessage]);
      } else {
        // Regular message without tasks
        const widgetMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: messageText,
          sender: "widget",
        };
        setMessages((prev) => [...prev, widgetMessage]);
      }

      // Play audio response
      const audio = await getTextToSpeech(messageText);
      if (audio) {
        const audioBlob = new Blob([Buffer.from(audio, "base64")], {
          type: "audio/mp3",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audioElement = new Audio(audioUrl);
        audioElement.play();
      }
    }
  };

  // Add this function to handle voice input
  const handleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice recognition is not supported in your browser");
      return;
    }

    // @ts-ignore
    const recognition = new (window as any).webkitSpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true; // Allow continuous results
    recognition.interimResults = true; // Show results as we speak

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    // @ts-ignore
    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      // Loop through the results to build both interim and final transcripts
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Update the input with either the final or interim transcript
      setInputText(finalTranscript || interimTranscript);
    };

    // Add timeout to automatically stop after 10 seconds
    setTimeout(() => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }, 10000);

    recognition.start();
  };

  return (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="fixed inset-0 bg-[#4ECAFF] z-30"
    >
      <div className="relative w-full h-full">
        <div className="absolute inset-0 z-0">
          <CurvedBackground2 />
        </div>

        <div className="relative z-10 p-4 h-full flex flex-col">
          <h2 className="text-2xl font-bold mb-4 self-center">Chat</h2>
          <button
            onClick={onClose}
            className="flex flex-col items-center mb-4 self-start"
          >
            <img src="/icons/exit.png" alt="back" className="w-10 h-10" />
            <div>← Back</div>
          </button>
          <motion.div
            className="w-full flex justify-center"
            style={{ zIndex: 50 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              damping: 8,
              stiffness: 100,
              delay: 0.7,
            }}
          >
            <img
              src="/character/idle.gif"
              alt="Centered Image"
              className="w-[128px]"
            />
          </motion.div>

          <div className="flex-1 overflow-y-auto px-4">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.2 * index,
                  duration: 0.3,
                }}
              >
                <div
                  className={`mb-4 ${
                    message.sender === "user"
                      ? "flex justify-end"
                      : "flex justify-start"
                  }`}
                >
                  {message.sender === "widget" && (
                    <div className="flex flex-col">
                      <div className="text-sm mb-1 font-semibold opacity-60">
                        Widget
                      </div>
                      <div className="text-black font-semibold">
                        {message.text}
                      </div>
                      <div className="flex flex-col gap-1">
                        {/* Render relevant task cards */}
                        {message.relevantTasks?.map((taskId) => {
                          const task = goals.find((g) => g.id === taskId);
                          if (task) {
                            return (
                              <ChatTaskCard
                                key={taskId}
                                task={task}
                                onSelectTask={() => onSelectTask(taskId)}
                              />
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  )}
                  {message.sender === "user" && (
                    <div className="bg-white rounded-2xl p-3 max-w-[80%]">
                      {message.text}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <div className="flex-1 relative flex items-center bg-white rounded-full shadow-sm pl-4">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                  className={`flex-1 bg-transparent border-none outline-none px-2 py-4 text-lg ${
                    isListening ? "bg-gray-50" : ""
                  }`}
                  placeholder="Say anything..."
                />
                <motion.div
                  className={`p-3 mr-2 flex items-center justify-center cursor-pointer rounded-full ${
                    isListening
                      ? "bg-red-100 animate-pulse"
                      : "hover:bg-gray-100"
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", damping: 10, stiffness: 100 }}
                  onClick={handleVoiceInput}
                >
                  <span className="text-3xl">{isListening ? "🔴" : "🎤"}</span>
                </motion.div>
              </div>
              <motion.div
                className="w-16 h-16 min-w-16 min-h-16 flex items-center justify-center cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", damping: 10, stiffness: 100 }}
                onClick={handleSendMessage}
              >
                <img src="/icons/chat.png" alt="Send" className="w-16 h-16" />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface Task {
  id: number;
  title: string;
  icon: string;
  done: boolean;
}

const SUGGESTED_GOALS = [
  { title: "Meal Prep", icon: "🥗" },
  { title: "Stretching", icon: "🏃" },
  { title: "Brush Teeth", icon: "🪥" },
  { title: "Call family or friends", icon: "📞" },
  { title: "Make Bed", icon: "🛏️" },
  { title: "Put away laundry", icon: "🧺" },
  { title: "Go for a walk", icon: "🚶" },
  { title: "Drink water", icon: "💧" },
  { title: "Read a book", icon: "📚" },
  { title: "Meditate", icon: "🧘" },
  { title: "Take a shower", icon: "🚿" },
  { title: "Wash dishes", icon: "🍽️" },
  { title: "Clean up", icon: "🧹" },
];

function TasksScreen({
  onClose,
  tasks,
  onAddTask,
  onDeleteTask,
}: {
  onClose: () => void;
  tasks: Task[];
  onAddTask: (title: string) => Promise<number | void>;
  onDeleteTask: (id: number) => void;
}) {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    setIsAdding(true);
    await onAddTask(newTaskTitle);
    setNewTaskTitle("");
    setIsAdding(false);
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="fixed inset-0 bg-[#F5F1E0] z-30"
    >
      <div className="h-full flex flex-col overflow-hidden">
        <div className="p-4 flex-shrink-0">
          <h2 className="text-2xl font-bold mb-4">Tasks</h2>
          <button
            onClick={onClose}
            className="flex flex-col items-center mb-4 self-start"
          >
            <img src="/icons/exit.png" alt="back" className="w-10 h-10" />
            <div>← Back</div>
          </button>

          {/* Add new task input */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 rounded-xl border px-4 py-2"
              onKeyPress={(e) => {
                if (e.key === "Enter") handleAddTask();
              }}
            />
            <button
              onClick={handleAddTask}
              disabled={isAdding}
              className="bg-blue-500 text-white px-4 py-2 rounded-xl disabled:opacity-50"
            >
              {isAdding ? "Adding..." : "Add"}
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Existing tasks list */}
          <div className="px-4 flex flex-col gap-4">
            <AnimatePresence>
              {tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{
                    scale: 0.3,
                    opacity: 0,
                    x: -100,
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    type: "spring",
                    damping: 20,
                    stiffness: 300,
                    delay: 0.3 + index * 0.1,
                  }}
                  className="bg-white rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {iconToImageUrl(task.icon) ? (
                        <img
                          src={iconToImageUrl(task.icon)}
                          alt={task.icon}
                          className="w-10 h-10"
                        />
                      ) : (
                        <div
                          className={`w-10 h-10 flex items-center justify-center text-4xl ${notoColorEmoji.className}`}
                        >
                          {task.icon}
                        </div>
                      )}
                      <span className="text-xl">{task.title}</span>
                    </div>
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="text-red-500 hover:text-red-700 transition-colors px-4 py-2 rounded-lg hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Suggested goals section */}
          <div className="p-4 mt-8">
            <h3 className="text-xl font-semibold mb-4">Try these goals!</h3>
            <div className="grid grid-cols-2 gap-3">
              {SUGGESTED_GOALS.map((goal, index) => (
                <motion.button
                  key={goal.title}
                  initial={{
                    scale: 0.3,
                    opacity: 0,
                    y: 50,
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    type: "spring",
                    damping: 20,
                    stiffness: 300,
                    delay: 0.5 + index * 0.1,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-white shadow-sm hover:bg-gray-50 transition-colors"
                  onClick={() => onAddTask(goal.title)}
                >
                  <span className={`text-2xl ${notoColorEmoji.className}`}>
                    {goal.icon}
                  </span>
                  <span className="text-left text-sm">{goal.title}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const generateEmojiForTask = async (taskTitle: string) => {
  const prompt = `Given this task title: "${taskTitle}", suggest a single emoji that best represents it. Only respond with the emoji, nothing else. For example, for "Go running" respond with "🏃". For "Make dinner" respond with "🍳".`;
  const emoji = await getChatCompletion(prompt);
  return emoji || "📝"; // Default emoji if API fails
};

function EmptyState({ onCreateTask }: { onCreateTask: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-8 text-center"
    >
      <span className={`text-6xl mb-4 ${notoColorEmoji.className}`}>✨</span>
      <h3 className="text-2xl font-bold mb-2">No goals yet!</h3>
      <p className="text-gray-600 mb-6">
        Let&apos;s create your first goal to get started
      </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-blue-600 transition-colors"
        onClick={onCreateTask}
      >
        Create a Goal
      </motion.button>
    </motion.div>
  );
}

function CoinCounter({
  coins,
  onClick,
}: {
  coins: number;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-white rounded-full py-2 px-4 shadow-lg cursor-pointer"
    >
      <img src="/icons/coins.jpg" alt="coins" className="w-6 h-6" />
      <span className={`font-bold text-lg text-black ${ubuntu.className}`}>
        {coins}
      </span>
    </motion.div>
  );
}

// Update the ShopItem interface and items
interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  type: "furniture" | "decoration" | "tech";
  position?: {
    top?: string;
    left?: string;
    right?: string;
  };
}

const SHOP_ITEMS: ShopItem[] = [
  {
    id: "chair",
    name: "Eames Chair",
    description: "A classic mid-century modern chair for your room",
    price: 200,
    image: "/stuff/chair.png",
    type: "furniture",
    position: {
      left: "5%",
      top: "30%",
    },
  },
  {
    id: "mattress",
    name: "Cozy Matttress",
    description: "No bedframe needed!",
    price: 200,
    image: "/stuff/mattress.png",
    type: "furniture",
    position: {
      left: "5%",
      top: "68%",
    },
  },
  {
    id: "desk",
    name: "Standing Desk",
    description: "Modern desk for your workspace",
    price: 200,
    image: "/stuff/desk.png",
    type: "furniture",
    position: {
      right: "5%",
      top: "40%",
    },
  },
  {
    id: "computer",
    name: "Computer",
    description: "High-tech computer for your desk",
    price: 500,
    image: "/stuff/computer.png",
    type: "tech",
  },
  {
    id: "boba",
    name: "Boba Tea",
    description: "A refreshing drink for your desk",
    price: 50,
    image: "/stuff/boba.png",
    type: "decoration",
  },
  {
    id: "poster",
    name: "OpenAI Wall Poster",
    description: "Add some style to your walls",
    price: 50,
    image: "/stuff/poster.png",
    type: "decoration",
    position: {
      top: "15%",
      right: "60%",
    },
  },
];

function CoinsScreen({
  onClose,
  coins,
  purchasedItems,
  onPurchaseItem,
}: {
  onClose: () => void;
  coins: number;
  purchasedItems: PurchasedItem[];
  onPurchaseItem: (item: ShopItem) => void;
}) {
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="fixed inset-0 bg-[#4ECAFF] z-30"
    >
      <div className="relative w-full h-full">
        <div className="absolute inset-0 z-0">
          <CurvedBackground2 />
        </div>

        <div className="relative z-10 p-4 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <button onClick={onClose} className="flex items-center gap-2">
              <img src="/icons/exit.png" alt="back" className="w-10 h-10" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-2 bg-white rounded-full py-2 px-4">
              <img src="/icons/coins.jpg" alt="coins" className="w-6 h-6" />
              <span className="font-bold">{coins}</span>
            </div>
          </div>

          {/* Shop Items */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              {SHOP_ITEMS.map((item) => {
                const isOwned = purchasedItems.some(
                  (purchased) => purchased.id === item.id
                );

                return (
                  <motion.div
                    key={item.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white rounded-xl p-4 shadow-sm"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 flex items-center justify-center mb-2">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <h3 className="font-bold mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-2 text-center">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                          {item.type}
                        </span>
                      </div>
                      <button
                        className={`mt-2 flex items-center gap-2 px-4 py-2 rounded-lg ${
                          isOwned
                            ? "bg-gray-300"
                            : coins >= item.price
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-gray-300"
                        } text-white transition-colors`}
                        disabled={isOwned || coins < item.price}
                        onClick={() => onPurchaseItem(item)}
                      >
                        {isOwned ? (
                          "Owned"
                        ) : (
                          <>
                            <img
                              src="/icons/coins.jpg"
                              alt="coins"
                              className="w-4 h-4"
                            />
                            <span>{item.price}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const getWidgetMessage = async (task: Task): Promise<string> => {
  const messages: Record<string, string[]> = {
    "Meal Prep": [
      "yummy! meal prep makes the whole week better! 🥗",
      "cooking time! i love watching humans make food! 🍳",
      "getting organized with food is super smart! proud of you! 🌟",
    ],
    Stretching: [
      "a bit of stretching every day will keep you healthy! 🌸",
      "time to get those muscles moving! you've got this! ✨",
      "stretching is my favorite! let's do this together! 🎈",
    ],
    "Brush Teeth": [
      "sparkly teeth make the happiest smiles! ✨",
      "keeping those teeth clean is super important! proud of you! 🦷",
      "brush brush brush! you're doing great! 🌟",
    ],
    "Put away laundry": [
      "clean room, happy space! you're doing amazing! 🧺",
      "folding clothes is like giving them little hugs! 🌸",
      "organizing is so fun! let's make everything neat! ✨",
    ],
  };

  // If we have predefined messages, use those
  if (messages[task.title]) {
    const taskMessages = messages[task.title];
    return taskMessages[Math.floor(Math.random() * taskMessages.length)];
  }

  // Otherwise, use AI to generate a message
  const prompt = `You are Widget, a cute and encouraging AI friend. Generate a single short encouraging message (max 10 words) about the task "${task.title}". The message should be lowercase, cute, and include an emoji at the end. Example: "stretching helps you feel amazing! 🌸" or "keeping organized makes everything better! ✨"`;

  try {
    const aiMessage = await getChatCompletion(prompt);
    return aiMessage || "you're doing great! i believe in you! 🌟";
  } catch (error) {
    // Fallback messages if AI fails
    const defaultMessages = [
      "you're doing great! i believe in you! 🌟",
      "every little step counts! proud of you! ✨",
      "yay! let&apos;s do this together! 🎈",
    ];
    return defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
  }
};

// Add this helper function to determine timer duration
const getTaskTimer = (task: Task): number | null => {
  const title = task.title.toLowerCase();
  if (title.includes("brush") || title.includes("teeth")) {
    return 120; // 2 minutes for brushing teeth
  }
  if (title.includes("stretch") || title.includes("stretching")) {
    return 300; // 5 minutes for stretching
  }
  return null;
};

// Add this new Timer component
function TaskTimer({
  seconds,
  onComplete,
}: {
  seconds: number;
  onComplete: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            onComplete();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete]);

  const minutes = Math.floor(timeLeft / 60);
  const remainingSeconds = timeLeft % 60;

  if (isCompleted) {
    return (
      <div className="bg-green-50 rounded-xl p-4 mb-4">
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl">🎉</span>
          <div className="text-xl font-bold text-green-600">
            congrats! you did it!!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 rounded-xl p-4 mb-4">
      <div className="flex flex-col items-center gap-4">
        <div className="text-3xl font-bold">
          {minutes}:{remainingSeconds.toString().padStart(2, "0")}
        </div>

        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`w-full py-3 rounded-lg text-lg font-semibold transition-colors ${
            isRunning
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          {isRunning ? "⏸️ Pause Timer" : "▶️ Start Timer"}
        </button>
      </div>
    </div>
  );
}

// Add new interface for purchased items
interface PurchasedItem {
  id: string;
  position?: {
    top?: string;
    left?: string;
    right?: string;
  };
}

// Add new SettingsScreen component
function SettingsScreen({
  onClose,
  email,
  onSignOut,
}: {
  onClose: () => void;
  email: string;
  onSignOut: () => void;
}) {
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="fixed inset-0 bg-[#4ECAFF] z-30"
    >
      <div className="relative w-full h-full">
        <div className="absolute inset-0 z-0">
          <CurvedBackground2 />
        </div>

        <div className="relative z-10 p-4 h-full flex flex-col">
          <div className="flex items-center mb-8">
            <button onClick={onClose} className="flex items-center gap-2">
              <img src="/icons/exit.png" alt="back" className="w-10 h-10" />
              <span>Back</span>
            </button>
          </div>

          <div className="flex-1">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6">Settings</h2>

              <div className="mb-6">
                <label className="text-sm text-gray-600">Email</label>
                <div className="text-lg">{email}</div>
              </div>

              <button
                onClick={onSignOut}
                className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function CoreApp() {
  const { user } = db.useAuth();
  const [selectedGoal, setSelectedGoal] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"home" | "chat" | "tasks">("home");
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [goals, setGoals] = useState([
    { id: 1, title: "Put away laundry", icon: "🧺", done: false },
    { id: 2, title: "Stretching", icon: "🏃", done: false },
    { id: 3, title: "Meal Prep", icon: "🥗", done: false },
    { id: 4, title: "Brush teeth", icon: "🪥", done: false },
  ]);

  const signout = async () => {
    await db.auth.signOut();
  };

  const handleChat = async () => {
    const response = await getChatCompletion("Hello, how are you?");
    if (!response) return;
    console.log(response);
    const audio = await getTextToSpeech(response);
    // play audio
    // this is a base64 string
    const audioBlob = new Blob([Buffer.from(audio, "base64")], {
      type: "audio/mp3",
    });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audioElement = new Audio(audioUrl);
    audioElement.play();
  };

  const iconToImageUrl = (icon: string) => {
    switch (icon) {
      case "🧺":
        return "/icons/laundry.png";
      case "🏃":
        return "/icons/stretch.png";
      case "🏙️":
        return "/icons/city.png";
      case "🪥":
        return "/icons/toothbrush.png";
    }
  };

  const taskContainsSpecialForm = (task: Task | undefined) => {
    if (!task) return null;
    if (task.title.includes("Run") || task.title.includes("run")) {
      return "RUN";
    }
    if (task.title.includes("stretch") || task.title.includes("Stretch")) {
      return "EXCERCISE";
    }
    if (
      task.title.includes("brush") ||
      task.title.includes("Brush") ||
      task.title.includes("teeth")
    ) {
      return "BRUSH";
    }
    if (task.title.includes("laundry") || task.title.includes("Laundry")) {
      return "LAUNDRY";
    }
    if (
      task.title.includes("dinner") ||
      task.title.includes("Dinner") ||
      task.title.includes("Meal") ||
      task.title.includes("meal") ||
      task.title.includes("cook") ||
      task.title.includes("Cook")
    ) {
      return "COOK";
    }
    return null;
  };

  const selectedGoalFromGoals = goals.find((t) => t.id === selectedGoal);
  const taskType = taskContainsSpecialForm(selectedGoalFromGoals);
  const [isCelebrating, setIsCelebrating] = useState(false);

  const handleTaskSelect = (taskId: number) => {
    setActiveTab("home");
    setTimeout(() => {
      setSelectedGoal(taskId);
    }, 200);
  };

  const handleAddTask = async (title: string) => {
    const emoji = await generateEmojiForTask(title);
    const newTask = {
      id: Math.floor(Math.random() * 1000000), // Random ID between 0 and 999999
      title,
      icon: emoji,
      done: false,
    };
    setGoals((prev) => [...prev, newTask]);
    return newTask.id; // Return the new task ID
  };

  const handleDeleteTask = (taskId: number) => {
    setGoals(goals.filter((goal) => goal.id !== taskId));
  };

  const [coins, setCoins] = useState(0);

  const handleMarkDone = () => {
    setGoals(
      goals.map((goal) =>
        goal.id === selectedGoal ? { ...goal, done: true } : goal
      )
    );
    setCoins((prev) => prev + 50); // Add 50 coins when marking a task as done
  };

  const [purchasedItems, setPurchasedItems] = useState<PurchasedItem[]>([
    // Start with some default items if desired
    { id: "mattress" },
    { id: "poster" },
  ]);

  // Add function to handle purchases
  const handlePurchaseItem = (item: ShopItem) => {
    if (coins >= item.price) {
      setCoins((prev) => prev - item.price);
      setPurchasedItems((prev) => [
        ...prev,
        {
          id: item.id,
          position: item.position,
        },
      ]);
    }
  };

  return (
    <div className="h-screen flex flex-col relative overflow-hidden bg-[#F5F1E0]">
      <AnimatePresence>
        {/* Add settings screen */}
        {isSettingsOpen && (
          <SettingsScreen
            onClose={() => setIsSettingsOpen(false)}
            email={user?.email || ""}
            onSignOut={signout}
          />
        )}

        {activeTab === "chat" && (
          <ChatScreen
            onClose={() => setActiveTab("home")}
            goals={goals}
            onSelectTask={handleTaskSelect}
            onAddTask={handleAddTask}
          />
        )}
        {activeTab === "tasks" && (
          <TasksScreen
            onClose={() => setActiveTab("home")}
            tasks={goals}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
          />
        )}
        {isShopOpen && (
          <CoinsScreen
            onClose={() => setIsShopOpen(false)}
            coins={coins}
            purchasedItems={purchasedItems}
            onPurchaseItem={handlePurchaseItem}
          />
        )}
        {activeTab === "home" && !isShopOpen && !isSettingsOpen && (
          <>
            <CoinCounter coins={coins} onClick={() => setIsShopOpen(true)} />

            {/* Add settings button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed top-4 right-4 z-50 p-2 bg-white rounded-full shadow-lg"
              onClick={() => setIsSettingsOpen(true)}
            >
              <span className="text-xl">⚙️</span>
            </motion.button>

            <CurvedBackground />
            {/* Room Scene - Fixed at top */}
            <div className="flex-none h-[40vh] relative z-10">
              <Widget
                taskType={taskType}
                isCelebrating={isCelebrating}
                purchasedItems={purchasedItems.map((item) => item.id)}
              />
            </div>
            {/* Scrollable Tasks List */}
            <div className="flex-1 overflow-y-auto pb-28 relative z-10">
              {goals.length === 0 ? (
                <EmptyState onCreateTask={() => setActiveTab("tasks")} />
              ) : (
                <div className="flex flex-col gap-4 p-4">
                  <AnimatePresence>
                    {goals.map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{
                          scale: 0.3,
                          opacity: 0,
                          x: -100,
                        }}
                        animate={{
                          scale: 1,
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          type: "spring",
                          damping: 20,
                          stiffness: 300,
                          delay: 0.3 + index * 0.1,
                        }}
                      >
                        <motion.div
                          layoutId={`task-${task.id}`}
                          className="cursor-pointer flex items-center justify-between bg-white rounded-xl p-4 shadow-sm"
                          transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 400,
                            duration: 0.2,
                          }}
                          onClick={() => setSelectedGoal(task.id)}
                        >
                          <div className="flex items-center gap-4">
                            {iconToImageUrl(task.icon) ? (
                              <img
                                src={iconToImageUrl(task.icon)}
                                alt={task.icon}
                                className="w-10 h-10"
                              />
                            ) : (
                              <div
                                className={`w-10 h-10 flex items-center justify-center text-4xl ${notoColorEmoji.className}`}
                              >
                                {task.icon}
                              </div>
                            )}
                            <span className="text-xl">{task.title}</span>
                          </div>
                          <div className="check-button-base p-2 px-4">
                            <span
                              className={`${
                                task.done
                                  ? "text-green-500 opacity-100"
                                  : "text-gray-500 opacity-50"
                              } font-extrabold text-xl`}
                            >
                              ✓
                            </span>
                          </div>
                        </motion.div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation - Fixed at bottom, above content */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#F5F1E0] p-2 z-20">
        <div className="flex justify-between px-12">
          <motion.div
            className="flex flex-col items-center gap-2 cursor-pointer"
            onClick={() => setActiveTab("chat")}
            initial={{ y: 50, opacity: 0, scale: 0.5 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              damping: 8, // Lower damping for more bounce
              stiffness: 100,
              delay: 0.8, // Delay after background
            }}
          >
            <motion.div
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.1 }}
              className="cursor-pointer"
            >
              <img src="/icons/chat.png" alt="chat" className="w-14 h-14" />
              <span className="text-xl">Chat</span>
            </motion.div>
          </motion.div>

          <motion.div
            className="flex flex-col items-center gap-2"
            initial={{ y: 50, opacity: 0, scale: 0.5 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              damping: 8,
              stiffness: 100,
              delay: 0.9, // Slightly later than the chat icon
            }}
            onClick={() => setActiveTab("home")}
          >
            <motion.div
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.1 }}
              className="cursor-pointer"
            >
              <img
                src="/icons/homehighlight.png"
                alt="tasks"
                className="w-14 h-14"
              />
              <span className="text-xl font-semibold">Home</span>
            </motion.div>
          </motion.div>

          <motion.div
            className="flex flex-col items-center gap-2"
            initial={{ y: 50, opacity: 0, scale: 0.5 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              damping: 8,
              stiffness: 100,
              delay: 0.9, // Slightly later than the chat icon
            }}
            onClick={() => setActiveTab("tasks")}
          >
            <motion.div
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.1 }}
              className="cursor-pointer"
            >
              <img
                src="/icons/clipboard.png"
                alt="tasks"
                className="w-14 h-14"
              />
              <span className="text-xl text-center">Tasks</span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {selectedGoal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10"
              onPointerDown={() => setSelectedGoal(null)}
            />
            <GoalExpanded
              task={goals.find((t) => t.id === selectedGoal)!}
              layoutId={`task-${selectedGoal}`}
              onClose={() => setSelectedGoal(null)}
              onMarkDone={handleMarkDone}
              onMarkNotDone={() => {
                setGoals(
                  goals.map((goal) =>
                    goal.id === selectedGoal ? { ...goal, done: false } : goal
                  )
                );
              }}
              onFinish={() => {
                setIsCelebrating(true);
                setTimeout(() => {
                  setIsCelebrating(false);
                }, 2000);
              }}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
