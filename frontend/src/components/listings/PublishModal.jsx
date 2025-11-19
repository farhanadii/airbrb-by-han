import { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Box, TextField, IconButton, Typography, Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

export default function PublishModal({ open, onClose, onPublish,
    listingTitle }) {
    const [availabilities, setAvailabilities] = useState([
        { start: '', end: '' }
    ]);
    const [error, setError] = useState('');

    const addAvailability = () => {
        setAvailabilities([...availabilities, { start: '', end: '' }]);
    };

    const removeAvailability = (index) => {
        setAvailabilities(availabilities.filter((_, i) => i !== index));
    };

    const updateAvailability = (index, field, value) => {
        const updated = [...availabilities];
        updated[index] = { ...updated[index], [field]: value };
        setAvailabilities(updated);
    };

    const handlePublish = () => {
        setError('');

        // Validation
        if (availabilities.length === 0) {
            setError('Please add at least one availability range');
            return;
        }

        for (let i = 0; i < availabilities.length; i++) {
            const { start, end } = availabilities[i];
            if (!start || !end) {
                setError(`Please fill in both start and end dates for availability 
  ${i + 1}`);
                return;
            }
            if (new Date(start) >= new Date(end)) {
                setError(`End date must be after start date for availability ${i +
                    1}`);
                return;
            }
        }

        // Format as required by backend
        const formattedAvailabilities = availabilities.map(av => ({
            start: av.start,
            end: av.end
        }));

        onPublish(formattedAvailabilities);
        handleClose();
    };

    const handleClose = () => {
        setAvailabilities([{ start: '', end: '' }]);
        setError('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Publish Listing: {listingTitle}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Set availability date ranges for when this property can be booked.
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {availabilities.map((availability, index) => (
                    <Box key={index} sx={{
                        mb: 2, p: 2, border: '1px solid #e0e0e0',
                        borderRadius: 1
                    }}>
                        <Box sx={{
                            display: 'flex', justifyContent: 'space-between',
                            alignItems: 'center', mb: 1
                        }}>
                            <Typography variant="subtitle2">Availability Range {index +
                                1}</Typography>
                            {availabilities.length > 1 && (
                                <IconButton size="small" color="error" onClick={() =>
                                    removeAvailability(index)}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            )}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Start Date"
                                type="date"
                                value={availability.start}
                                onChange={(e) => updateAvailability(index, 'start',
                                    e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                            <TextField
                                label="End Date"
                                type="date"
                                value={availability.end}
                                onChange={(e) => updateAvailability(index, 'end',
                                    e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                        </Box>
                    </Box>
                ))}

                <Button
                    startIcon={<AddIcon />}
                    onClick={addAvailability}
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 1 }}
                >
                    Add Another Date Range
                </Button>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handlePublish} variant="contained">
                    Publish Listing
                </Button>
            </DialogActions>
        </Dialog>
    );
}
