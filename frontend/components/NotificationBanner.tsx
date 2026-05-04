interface NotificationBannerProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

export default function NotificationBanner({ type, message, onClose }: NotificationBannerProps) {
  return (
    <div style={{
      padding: '12px 16px',
      marginBottom: '1rem',
      borderRadius: '6px',
      backgroundColor: type === 'success' ? '#dcfce7' : '#fee2e2',
      color: type === 'success' ? '#166534' : '#991b1b',
      border: `1px solid ${type === 'success' ? '#bbf7d0' : '#fecaca'}`,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      fontWeight: 500
    }}>
      <span style={{ whiteSpace: 'pre-wrap' }}>{message}</span>
      <button 
        type="button" 
        onClick={onClose} 
        style={{ 
          background: 'none', 
          border: 'none', 
          fontSize: '18px', 
          cursor: 'pointer', 
          color: 'inherit', 
          marginLeft: '10px' 
        }}
      >
        &times;
      </button>
    </div>
  );
}
