import { Box, TextField, IconButton, Typography, Paper } from
    '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

export default function BedroomInput({ bedrooms, onChange }) {
    const addBedroom = () => {
        onChange([...bedrooms, { beds: 1, type: 'Single' }]);
    };

    const removeBedroom = (index) => {
        onChange(bedrooms.filter((_, i) => i !== index));
    };

    const updateBedroom = (index, field, value) => {
        const updated = [...bedrooms];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    return (
        <Box>
            <Box sx={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', mb: 2
            }}>
                <Typography variant="subtitle1">Bedrooms</Typography>
                <IconButton color="primary" onClick={addBedroom} size="small">
                    <AddIcon />
                </IconButton>
            </Box>

            {bedrooms.map((bedroom, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ minWidth: 80 }}>
                            Bedroom {index + 1}
                        </Typography>
                        <TextField
                            label="Number of Beds"
                            type="number"
                            size="small"
                            value={bedroom.beds}
                            onChange={(e) => updateBedroom(index, 'beds',
                                parseInt(e.target.value) || 0)}
                            inputProps={{ min: 1 }}
                            sx={{ flex: 1 }}
                        />
                        <TextField
                            label="Bed Type"
                            size="small"
                            value={bedroom.type}
                            onChange={(e) => updateBedroom(index, 'type', e.target.value)}
                            placeholder="e.g. Single, Double, Queen"
                            sx={{ flex: 1 }}
                        />
                        <IconButton color="error" onClick={() => removeBedroom(index)}
                            size="small">
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                </Paper>
            ))}

            {bedrooms.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                    No bedrooms added. Click + to add a bedroom.
                </Typography>
            )}
        </Box>
    );
}
