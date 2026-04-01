import { useState, useRef } from 'react';
import { DocumentSnapshot } from 'firebase/firestore';

type PageResult<T> = { data: T[]; lastVisible: DocumentSnapshot | null };

function useCursorPagination<T>(
  pageSize: number,
  fetchFirst: () => Promise<PageResult<T>>,
  fetchNext: (cursor: DocumentSnapshot) => Promise<PageResult<T>>,
) {
  const [items, setItems] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
  const [cursorStack, setCursorStack] = useState<DocumentSnapshot[]>([]);
  const [hasNext, setHasNext] = useState(false);

  const fetchFirstRef = useRef(fetchFirst);
  const fetchNextRef = useRef(fetchNext);
  fetchFirstRef.current = fetchFirst;
  fetchNextRef.current = fetchNext;

  async function loadFirst() {
    const { data, lastVisible: last } = await fetchFirstRef.current();
    setItems(data);
    setLastVisible(last);
    setCursorStack([]);
    setCurrentPage(1);
    setHasNext(data.length === pageSize);
  }

  async function handleNext() {
    if (!lastVisible) return;
    const currentCursor = lastVisible;
    const { data, lastVisible: newLast } = await fetchNextRef.current(currentCursor);
    setCursorStack((prev) => [...prev, currentCursor]);
    setItems(data);
    setLastVisible(newLast);
    setCurrentPage((p) => p + 1);
    setHasNext(data.length === pageSize);
  }

  async function handlePrev() {
    const stack = [...cursorStack];
    stack.pop();
    const prevCursor = stack[stack.length - 1];
    setCursorStack(stack);

    if (!prevCursor) {
      const { data, lastVisible: newLast } = await fetchFirstRef.current();
      setItems(data);
      setLastVisible(newLast);
    } else {
      const { data, lastVisible: newLast } = await fetchNextRef.current(prevCursor);
      setItems(data);
      setLastVisible(newLast);
    }
    setCurrentPage((p) => p - 1);
    setHasNext(true);
  }

  return { items, currentPage, hasNext, loadFirst, handleNext, handlePrev };
}

export default useCursorPagination;
