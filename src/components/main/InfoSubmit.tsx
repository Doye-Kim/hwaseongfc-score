import { useRef, useState } from 'react';
import styles from './InfoSubmit.module.css';
import commonStyles from '@/pages/MainPage.module.css';
import { useIsMobile } from '@/hooks/useIsMobile';
import { submitPrediction } from '@/lib/firebase/predictions';

interface InfoSubmitProps {
  gameId: string;
  hwaseongScore: number;
  opponentScore: number;
  onClose: () => void;
  setSubmitted: (v: boolean) => void;
}
const InfoSubmit = ({
  gameId,
  hwaseongScore,
  opponentScore,
  onClose,
  setSubmitted,
}: InfoSubmitProps) => {
  const isMobile = useIsMobile();
  const modalRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [closing, setClosing] = useState(false);

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    if (digits.length < 4) return digits;
    if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  function handleClose() {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 300);
  }

  async function handleFinalSubmit() {
    if (!name.trim() || !phone.trim()) {
      window.confirm('이름과 전화번호는 빈 칸으로 제출할 수 없습니다.');
      return;
    }

    try {
      await submitPrediction({
        gameId,
        name,
        phone,
        homeScore: hwaseongScore,
        opponentScore,
      });
      setSubmitted(true);
      handleClose();
    } catch (e) {
      if (e instanceof Error) alert(e.message);
    }
  }
  return (
    <div
      onClick={handleClose}
      className={` ${
        isMobile ? styles.modalOverlay : styles.modalOverlayDesktop
      }`}>
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className={`${styles.modal} ${isMobile ? '' : styles.modalDesktop} ${
          closing ? styles.closing : ''
        }`}>
        <p className={styles.modalTitle}>참여자 정보 입력</p>
        <p className={styles.subText} style={{ marginBottom: 20 }}>
          경품 당첨 시 연락을 위해 입력해 주세요
        </p>
        <input
          className={styles.input}
          placeholder='이름'
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className={styles.input}
          style={{ marginTop: 10 }}
          placeholder="전화번호 ('-' 없이 숫자만 입력)"
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          type='tel'
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button
            className={commonStyles.submitBtn}
            style={{ background: 'var(--secondary)', flex: 1 }}
            onClick={onClose}>
            취소
          </button>
          <button
            className={commonStyles.submitBtn}
            style={{ flex: 2 }}
            onClick={handleFinalSubmit}>
            제출하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoSubmit;
