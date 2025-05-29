
import React, { useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinAttempt: (roomId: string, playerName: string) => void;
}

const JoinRoomModal: React.FC<JoinRoomModalProps> = ({ isOpen, onClose, onJoinAttempt }) => {
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState(`Player${Math.floor(Math.random() * 1000)}`);

  const handleSubmit = () => {
    if (roomId.trim() && playerName.trim()) {
      onJoinAttempt(roomId.trim(), playerName.trim());
    } else {
      alert("Room ID and Player Name cannot be empty!");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join an Adventure">
      <div className="space-y-4">
        <Input
          label="Enter Room ID"
          placeholder="Ask your friend for the ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          maxLength={10}
        />
        <Input
          label="Your Hero's Name"
          placeholder="Sir Reginald III"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          maxLength={30}
        />
        <div className="flex justify-end space-x-3 pt-2">
          <Button onClick={onClose} variant="secondary">Cancel</Button>
          <Button onClick={handleSubmit} variant="primary">Join Adventure</Button>
        </div>
      </div>
    </Modal>
  );
};

export default JoinRoomModal;
