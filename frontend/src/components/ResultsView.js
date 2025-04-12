import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RecyclingIcon from '@mui/icons-material/Recycling';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

function ResultsView({ results }) {
  if (!results) {
    return null;
  }

  const { original_image, annotated_image, detections } = results;

  // API URL prefix (based on your backend)
  const apiUrl = 'http://localhost:5000';

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Detection Results
      </Typography>

      <Grid container spacing={3}>
        {/* Images */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              image={`${apiUrl}${annotated_image}`}
              alt="Detected E-waste items"
              sx={{ width: '100%', objectFit: 'contain' }}
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {detections.length} item{detections.length !== 1 ? 's' : ''} detected
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Detection details */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Detected Objects
            </Typography>
            <List>
              {detections.map((detection, index) => (
                <React.Fragment key={index}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{ flexDirection: 'column' }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle1" component="div">
                        {detection.class}
                      </Typography>
                      <Chip
                        label={`${Math.round(detection.confidence * 100)}%`}
                        size="small"
                        color={
                          detection.confidence > 0.7
                            ? 'success'
                            : detection.confidence > 0.5
                            ? 'primary'
                            : 'default'
                        }
                      />
                    </Box>

                    {/* Recycling Suggestions */}
                    {detection.recycling_suggestions && detection.recycling_suggestions.length > 0 && (
                      <Accordion sx={{ width: '100%', mb: 1 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <RecyclingIcon color="primary" sx={{ mr: 1 }} />
                            <Typography>Recycling Suggestions</Typography>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <List dense disablePadding>
                            {detection.recycling_suggestions.map((suggestion, i) => (
                              <ListItem key={i} sx={{ py: 0.5 }}>
                                <ListItemText primary={suggestion} />
                              </ListItem>
                            ))}
                          </List>
                        </AccordionDetails>
                      </Accordion>
                    )}

                    {/* Reuse Ideas */}
                    {detection.reuse_ideas && detection.reuse_ideas.length > 0 && (
                      <Accordion sx={{ width: '100%' }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LightbulbIcon color="secondary" sx={{ mr: 1 }} />
                            <Typography>Creative Reuse Ideas</Typography>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <List dense disablePadding>
                            {detection.reuse_ideas.map((idea, i) => (
                              <ListItem key={i} sx={{ py: 0.5 }}>
                                <ListItemText primary={idea} />
                              </ListItem>
                            ))}
                          </List>
                        </AccordionDetails>
                      </Accordion>
                    )}
                  </ListItem>
                  {index < detections.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ResultsView; 