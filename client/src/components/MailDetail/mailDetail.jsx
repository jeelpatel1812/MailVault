import React, {useEffect} from 'react';
import { useParams } from 'react-router-dom';
// import { connect } from 'react-redux';
const MailDetail = ({ email }) => {
//   if (!email) {
//     return (
//       <div style={{ flex: 1, padding: '20px', textAlign: 'center' }}>
//         <h2>Select an email to view details</h2>
//       </div>
//     );
//   }
  const { id } = useParams();
  console.log("idddd", id);
  useEffect(() => {
    console.log('Rendered');
  }, []);

  return (
    <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          background: 'white',
          zIndex: 10,
          paddingBottom: '10px',
          borderBottom: '1px solid #ccc',
        }}
      >
        <h2>{email?.subject || "dedsdf"}</h2>
        <p style={{ color: '#666' }}>From: {email?.sender ||"sadf "}</p>
        <p style={{ color: '#666' }}>Date: {email?.date ||  "12/12/1212"}</p>
      </div>

      {/* Email Body */}
      <div>
        <h3>Email Content:</h3>
        <p style={{ fontSize: '16px', lineHeight: '1.6' }}>{email?.body || 'asdfgds'}</p>
      </div>

      {/* Attachment Section */}
      {email?.attachment && (
        <div
          style={{
            border: '1px solid #ccc',
            padding: '15px',
            borderRadius: '8px',
            background: '#f9f9f9',
          }}
        >
          <h3>Attachment:</h3>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'white',
              padding: '10px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: 'bold' }}>{email?.attachment?.name}</p>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{email?.attachment?.size}</p>
            </div>
            <a
              href={email.attachment.url}
              download
              style={{
                textDecoration: 'none',
                color: 'white',
                backgroundColor: '#007bff',
                padding: '8px 12px',
                borderRadius: '5px',
              }}
            >
              Download
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

// // Map Redux State to Props
// const mapStateToProps = (state) => ({
//   email: state.selectedEmail,
// });

export default MailDetail;
// export default connect(mapStateToProps)(MailDetail);
