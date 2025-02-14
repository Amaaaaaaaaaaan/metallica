import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const handleSuccess = (msg) => {
    toast.success(
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <strong style={{ fontSize: '16px', marginBottom: '4px' }}>Success</strong>
            <span style={{ fontSize: '14px' }}>{msg}</span>
        </div>,
        {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            style: {
                backgroundColor: '#ff007f', // semi-transparent red
                color: '#fff',
                fontSize: '16px',
                fontWeight: 'bold',
                fontFamily: 'Poppins', // custom font
                backdropFilter: 'blur(10px)', // blur effect
                textAlign: 'center', // Center-align the text
            },
            icon: '✅',
        }
    );
};

export const handleError = (msg) => {
    toast.error(
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <strong style={{ fontSize: '16px', marginBottom: '4px' }}>Empty Fields</strong>
            <span style={{ fontSize: '14px' }}>{msg}</span>
        </div>,
        {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            style: {
                backgroundColor: '#FF6B6B', // Dark background
                color: '#fff', // White text
                fontSize: '14px',
                fontWeight: 'normal',
                fontFamily: 'Arial, sans-serif',
                borderLeft: '4px solid #ff6f61', // Accent border
                padding: '12px', // Padding inside the toast
                borderRadius: '4px', // Slightly rounded corners
                boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)', // Subtle shadow
            },
        }
    );
};

/*


import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const handleError = (msg) => {
    toast.error(
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <strong style={{ fontSize: '16px', marginBottom: '4px' }}>Empty Fields</strong>
            <span style={{ fontSize: '14px' }}>{msg}</span>
        </div>,
        {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            style: {
                backgroundColor: '#1e1e2f', // Dark background
                color: '#fff', // White text
                fontSize: '14px',
                fontWeight: 'normal',
                fontFamily: 'Arial, sans-serif',
                borderLeft: '4px solid #ff6f61', // Accent border
                padding: '12px', // Padding inside the toast
                borderRadius: '4px', // Slightly rounded corners
                boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)', // Subtle shadow
            },
        }
    );
};

*/