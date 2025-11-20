import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

export default function GroupQuiz({ group, onClose, onSuccess }) {
  const { showNotification } = useNotification();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, [group._id]);

  const fetchQuiz = async () => {
    try {
      const response = await api.get(`/groups/${group._id}/quiz`);
      setQuiz(response.data);
      setAnswers(new Array(response.data.questions.length).fill(null));
      setLoading(false);
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to load quiz', 'error');
      onClose();
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    if (answers.some(answer => answer === null)) {
      showNotification('Please answer all questions before submitting', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      // Prepare answers with correctness check
      const submissionAnswers = answers.map((selectedAnswer, index) => ({
        questionId: index,
        selectedAnswer: selectedAnswer,
        isCorrect: selectedAnswer === quiz.questions[index].correctAnswer
      }));

      const response = await api.post(`/groups/${group._id}/submit-quiz`, { 
        answers: submissionAnswers 
      });
      setResult(response.data);
      
      if (response.data.success) {
        showNotification(response.data.message, 'success');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 3000);
      } else {
        showNotification(response.data.message, 'error');
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to submit quiz', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
          <div className="text-center text-white">Loading quiz...</div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
          <div className="text-center">
            <div className={`text-6xl mb-4 ${result.success ? 'text-green-500' : 'text-red-500'}`}>
              {result.success ? '🎉' : '😔'}
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">
              {result.success ? 'Congratulations!' : 'Not Quite There'}
            </h3>
            <div className="mb-6">
              <div className="text-5xl font-bold text-white mb-2">{result.score}/10</div>
              <p className="text-gray-400">{result.message}</p>
            </div>
            {result.success ? (
              <p className="text-green-400 mb-4">You've unlocked access to {group.name}!</p>
            ) : (
              <div className="text-yellow-400 mb-4">
                <p>Group will be locked for 7 days.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Locked until: {new Date(result.lockedUntil).toLocaleDateString()}
                </p>
              </div>
            )}
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition-colors font-semibold w-full"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white">{group.name} Quiz</h3>
            <p className="text-sm text-gray-400">Pass with 7/10 to unlock this group</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h4 className="text-xl font-semibold text-white mb-4">{question.question}</h4>
          
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  answers[currentQuestion] === index
                    ? 'border-blue-500 bg-blue-600/20'
                    : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    answers[currentQuestion] === index
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-600'
                  }`}>
                    {answers[currentQuestion] === index && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="text-gray-200">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Answer Indicator */}
        <div className="mb-6">
          <div className="flex gap-2 flex-wrap">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold ${
                  index === currentQuestion
                    ? 'bg-blue-600 text-white'
                    : answers[index] !== null
                    ? 'bg-green-600/30 text-green-300 border border-green-600'
                    : 'bg-gray-700 text-gray-400 border border-gray-600'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex gap-3">
            {currentQuestion < quiz.questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition-colors font-semibold"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || answers.some(a => a === null)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-500 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700 rounded text-xs text-blue-300">
          <p className="font-semibold mb-1">📝 Quiz Instructions:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Answer all 10 questions</li>
            <li>You need 7 correct answers to pass</li>
            <li>If you fail, the group will be locked for 7 days</li>
            <li>You can navigate between questions using the buttons</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
