import { useState } from 'react';
import styles from '@/pages/AdminPage.module.css';
import { TEAM_NAMES } from '@/constants/teams';

interface ScoreInputModalProps {
  opponentKey: string;
  onConfirm: (home: number, opponent: number) => void;
  onClose: () => void;
}

const ScoreInputModal = ({
  opponentKey,
  onConfirm,
  onClose,
}: ScoreInputModalProps) => {
  const [home, setHome] = useState(0);
  const [opponent, setOpponent] = useState(0);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>경기 결과 입력</h3>
        <p className={styles.modalDesc}>
          {TEAM_NAMES['hwaseong']} vs {TEAM_NAMES[opponentKey]}
        </p>
        <div className={styles.scoreInputWrap}>
          <input
            type='number'
            className={styles.scoreInput}
            value={home}
            onChange={(e) => setHome(Number(e.target.value))}
          />
          <span className={styles.scoreDivider}>:</span>
          <input
            type='number'
            className={styles.scoreInput}
            value={opponent}
            onChange={(e) => setOpponent(Number(e.target.value))}
          />
        </div>
        <div className={styles.modalBtnWrap}>
          <button className={styles.modalCancelBtn} onClick={onClose}>
            취소
          </button>
          <button
            className={styles.modalConfirmBtn}
            onClick={() => onConfirm(home, opponent)}>
            다운로드
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoreInputModal;
