import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  DialogContent,
  CircularProgress,
  Typography,
  Box
} from "@mui/material";

interface AddModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSubmit?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

const AddModal: React.FC<AddModalProps> = ({
  isOpen,
  title,
  children,
  onClose,
  onSubmit,
  isLoading = false,
  submitLabel = "Submit",
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '400px',
          maxWidth: '100%',
          padding: '5px',
          borderRadius: '7px',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: '18px',
          color: 'black',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '15px',
          marginTop:'10px',
          fontWeight:'bold !important'
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize:'15px', fontFamily:'sans-serif', }}>
            {children}
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '5px',
        }}
      >
        <Button
          onClick={onClose}
          sx={{ textTransform: 'capitalize' }}
        >
          Close
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isLoading}
          sx={{
            textTransform: 'capitalize',
            backgroundColor: '#3E79F7',
            color: 'white',
            height: '30px',
            '&:hover': {
              backgroundColor: '#2a56d1',
            },
          }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddModal;
