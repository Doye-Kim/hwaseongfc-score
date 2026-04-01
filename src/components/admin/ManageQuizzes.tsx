import { getDocs } from 'firebase/firestore';
import { useState, useEffect, useRef } from 'react';
import { getGamesQuery, formatGames } from '@/lib/firebase/admin';
import { useServerOffset } from '@/context/ServerTimeContext';
import { getAllQuizzes } from '@/lib/firebase/quizzes';
import QuizParticipants from './QuizParticipants';
import QuizCreateForm from './QuizCreateForm';
import { Game, Quiz } from '@/types';
import QuizList from './QuizList';

const ManageQuizzes = () => {
  const offset = useServerOffset();
  const initialized = useRef(false);
  const [now, setNow] = useState(Date.now() + offset);
  const [games, setGames] = useState<Game[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now() + offset), 60000);
    return () => clearInterval(t);
  }, [offset]);

  useEffect(() => {
    async function fetchGames() {
      const snapshot = await getDocs(getGamesQuery());
      setGames(formatGames(snapshot, offset));
      initialized.current = true;
    }
    fetchGames();
  }, [offset]);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  async function fetchQuizzes() {
    setQuizzes(await getAllQuizzes());
  }

  return (
    <>
      <QuizCreateForm games={games} onCreated={fetchQuizzes} />
      <QuizList
        games={games}
        quizzes={quizzes}
        now={now}
        onChanged={fetchQuizzes}
      />
      <QuizParticipants quizzes={quizzes} games={games} />
    </>
  );
};

export default ManageQuizzes;
