import React, { useState, useEffect } from 'react';
import { 
  AppBar, Toolbar, Typography, Container, Box, Paper, Button, 
  Card, CardContent, CardMedia, List, ListItem, ListItemText,
  Divider, Chip, CircularProgress, Grid, Tab, Tabs
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RecyclingIcon from '@mui/icons-material/Recycling';
import BarChartIcon from '@mui/icons-material/BarChart';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

// Styled components
const UploadInput = styled('input')({
  display: 'none',
});

const UploadCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRadius: 8,
  border: '2px dashed #4caf50',
  backgroundColor: 'rgba(76, 175, 80, 0.04)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
  },
  marginBottom: theme.spacing(4)
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 8,
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
}));

const Header = ({ currentTab, onTabChange }) => (
  <AppBar position="static">
    <Toolbar>
      <RecyclingIcon sx={{ mr: 2 }} />
      <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
        Trashify
      </Typography>
      <Tabs 
        value={currentTab} 
        onChange={onTabChange} 
        textColor="inherit"
        indicatorColor="secondary"
      >
        <Tab label="Detection" icon={<CloudUploadIcon />} iconPosition="start" />
        <Tab label="Statistics" icon={<BarChartIcon />} iconPosition="start" />
      </Tabs>
    </Toolbar>
  </AppBar>
);

const ImageUpload = ({ onImageUpload, loading }) => (
  <UploadCard>
    <Box sx={{ p: 3, textAlign: 'center' }}>
      {loading ? (
        <CircularProgress size={60} color="primary" />
      ) : (
        <>
          <CloudUploadIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Drop your e-waste image here
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            or click to browse files
          </Typography>
          <UploadInput
            accept="image/*"
            id="contained-button-file"
            type="file"
            onChange={(e) => e.target.files[0] && onImageUpload(e.target.files[0])}
            disabled={loading}
          />
          <label htmlFor="contained-button-file">
            <Button 
              variant="contained" 
              component="span" 
              startIcon={<CloudUploadIcon />}
              disabled={loading}
            >
              Upload Image
            </Button>
          </label>
        </>
      )}
    </Box>
  </UploadCard>
);

const ResultsView = ({ results }) => {
  if (!results) return null;
  
  // Debug output to console
  console.log("Detection results:", results);
  
  // Default suggestions to use when backend doesn't provide any
  const defaultRecycling = [
    "Take to a certified e-waste recycling center",
    "Check with manufacturer for take-back programs",
    "Dispose at a community e-waste collection event"
  ];
  
  // Specific creative reuse ideas for different types of e-waste
  const creativeReuseIdeas = {
    mouse: [
      "Turn into a retro desk lamp by adding LED lights",
      "Create a quirky keychain or bag charm",
      "Make a small plant holder for tiny succulents",
      "Use internal weights for a DIY fishing lure"
    ],
    tv: [
      "Convert into a digital aquarium or photo frame",
      "Transform the screen into an illuminated wall art piece",
      "Repurpose the casing as a cat bed or pet house",
      "Create a weather station display for your home"
    ],
    laptop: [
      "Turn screen into a smart mirror with LED backlighting",
      "Create a digital cookbook stand for your kitchen",
      "Repurpose as a wall-mounted family calendar",
      "Use as dedicated music or media streaming station"
    ],
    keyboard: [
      "Create wall art with colorful keycaps",
      "Make a unique jewelry holder or organizer",
      "Build a music controller for digital instruments",
      "Design a quirky doormat from waterproof keyboards"
    ],
    charger: [
      "Convert into a cord organizer or cable holder",
      "Create a small hanging planter with the cable",
      "Make a smartphone holder from multiple chargers",
      "Design cable art for wall decoration"
    ],
    circuit_board: [
      "Create framed tech artwork for modern homes",
      "Make unique coasters or placemats",
      "Design futuristic costume jewelry and accessories",
      "Craft a geeky business card holder"
    ],
    mobile: [
      "Repurpose as a dedicated smart home controller",
      "Convert into a security camera for your home",
      "Create a media center remote with custom apps",
      "Use as a digital photo frame with slideshow features"
    ],
    adapter: [
      "Create a modern desk organizer using multiple adapters",
      "Make a unique paperweight for your office",
      "Design industrial-style bookends",
      "Build a tech-inspired pen holder"
    ],
    battery: [
      "Use casings for small storage containers",
      "Create a weight for DIY projects requiring balance",
      "Make a holder for small craft supplies",
      "Design a small desk toy or fidget gadget"
    ]
  };

  // Default ideas for items not specifically covered
  const defaultReuse = [
    "Create a tech-inspired art piece or sculpture",
    "Build a STEM educational project for children",
    "Design a unique home decor item showcasing tech history",
    "Make a conversation-starting desk accessory"
  ];

  // Use object detection class to determine specific reuse ideas
  const getCreativeReuse = (itemClass) => {
    // Convert to lowercase and handle potential class variations
    const normalizedClass = itemClass.toLowerCase().replace(/\s+/g, '_');
    
    // Check each key in our ideas object to see if it matches part of the detected class
    for (const key in creativeReuseIdeas) {
      if (normalizedClass.includes(key) || key.includes(normalizedClass)) {
        return creativeReuseIdeas[key];
      }
    }
    
    // Return default ideas if no specific match
    return defaultReuse;
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Detection Results
      </Typography>
      
      {results.detections && results.detections.length > 0 ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {results.annotated_image && (
              <Card sx={{ mb: 3 }}>
                <CardMedia
                  component="img"
                  image={`http://localhost:5000${results.annotated_image}`}
                  alt="Processed Image"
                  sx={{ width: '100%', height: 'auto' }}
                  onError={(e) => {
                    console.error("Image failed to load");
                    e.target.src = 'https://via.placeholder.com/600x400?text=Image+Processing+Error';
                  }}
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    {results.detections.length} item{results.detections.length !== 1 ? 's' : ''} detected
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h5" component="h3" sx={{ mb: 2 }}>
              Detected Objects
            </Typography>
            
            <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
              {results.detections.map((item, index) => (
                <React.Fragment key={index}>
                  <ListItem alignItems="flex-start" sx={{ flexDirection: 'column' }}>
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" component="div">
                        {item.class}
                      </Typography>
                      <Chip 
                        label={`${Math.round(item.confidence * 100)}%`} 
                        color={item.confidence > 0.7 ? "success" : item.confidence > 0.5 ? "primary" : "default"}
                        size="small" 
                      />
                    </Box>
                    
                    {/* Always show recycling suggestions */}
                    <Box sx={{ mt: 1, width: '100%' }}>
                      <Typography variant="subtitle2" color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
                        <RecyclingIcon fontSize="small" sx={{ mr: 0.5 }} />
                        Recycling Suggestions:
                      </Typography>
                      <List dense disablePadding>
                        {(item.recycling_suggestions && item.recycling_suggestions.length > 0) ? (
                          // Use backend suggestions if available
                          item.recycling_suggestions.map((suggestion, i) => (
                            <ListItem key={i} sx={{ pl: 2 }}>
                              <ListItemText primary={suggestion} />
                            </ListItem>
                          ))
                        ) : (
                          // Use default suggestions otherwise
                          defaultRecycling.map((suggestion, i) => (
                            <ListItem key={i} sx={{ pl: 2 }}>
                              <ListItemText primary={suggestion} />
                            </ListItem>
                          ))
                        )}
                      </List>
                    </Box>
                    
                    {/* Always show reuse ideas */}
                    <Box sx={{ mt: 1, width: '100%' }}>
                      <Typography variant="subtitle2" color="secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                        <LightbulbIcon fontSize="small" sx={{ mr: 0.5 }} />
                        Creative Reuse Ideas:
                      </Typography>
                      <List dense disablePadding>
                        {(item.reuse_ideas && item.reuse_ideas.length > 0) ? (
                          // Use backend ideas if available
                          item.reuse_ideas.map((idea, i) => (
                            <ListItem key={i} sx={{ pl: 2 }}>
                              <ListItemText primary={idea} />
                            </ListItem>
                          ))
                        ) : (
                          // Use creative AI-generated reuse ideas based on the detected item
                          getCreativeReuse(item.class).map((idea, i) => (
                            <ListItem key={i} sx={{ pl: 2 }}>
                              <ListItemText primary={idea} />
                            </ListItem>
                          ))
                        )}
                      </List>
                    </Box>
                  </ListItem>
                  {index < results.detections.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Grid>
        </Grid>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">No objects detected. Try a different image.</Typography>
        </Paper>
      )}
    </Box>
  );
};

const StatsView = ({ stats }) => {
  if (!stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const { total_processed_images, total_detections, detection_breakdown, processing_time_avg } = stats;
  
  // Calculate total potential impact
  const recyclingImpact = {
    waterSaved: total_detections * 2.5, // liters
    energySaved: total_detections * 35, // kWh
    co2Reduced: total_detections * 1.2, // kg
    landfilSpace: total_detections * 0.1, // cubic meters
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        E-waste Detection Statistics
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <Typography color="text.secondary" gutterBottom>
              Images Processed
            </Typography>
            <Typography variant="h3" component="div" color="primary" sx={{ fontWeight: 'bold' }}>
              {total_processed_images}
            </Typography>
          </StatsCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <Typography color="text.secondary" gutterBottom>
              Items Detected
            </Typography>
            <Typography variant="h3" component="div" color="primary" sx={{ fontWeight: 'bold' }}>
              {total_detections}
            </Typography>
          </StatsCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <Typography color="text.secondary" gutterBottom>
              Avg. Processing Time
            </Typography>
            <Typography variant="h3" component="div" color="primary" sx={{ fontWeight: 'bold' }}>
              {processing_time_avg.toFixed(2)}s
            </Typography>
          </StatsCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <Typography color="text.secondary" gutterBottom>
              E-waste Types
            </Typography>
            <Typography variant="h3" component="div" color="primary" sx={{ fontWeight: 'bold' }}>
              {Object.keys(detection_breakdown).length}
            </Typography>
          </StatsCard>
        </Grid>
      </Grid>
      
      <Typography variant="h5" component="h3" gutterBottom sx={{ mt: 5 }}>
        Detection Breakdown
      </Typography>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          {Object.entries(detection_breakdown).map(([item, count]) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                  {item}:
                </Typography>
                <Typography variant="h6" color="primary">
                  {count}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(count / total_detections) * 100} 
                sx={{ height: 8, borderRadius: 4, my: 1 }}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Typography variant="h5" component="h3" gutterBottom sx={{ mt: 5 }}>
        Environmental Impact Estimation
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        If all detected e-waste items were recycled instead of landfilled:
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard sx={{ bgcolor: '#e8f5e9' }}>
            <Typography variant="h6" align="center" gutterBottom>
              Water Saved
            </Typography>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
              {recyclingImpact.waterSaved.toFixed(1)}L
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Equivalent to {(recyclingImpact.waterSaved / 150).toFixed(1)} showers
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard sx={{ bgcolor: '#e8f5e9' }}>
            <Typography variant="h6" align="center" gutterBottom>
              Energy Saved
            </Typography>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
              {recyclingImpact.energySaved.toFixed(1)} kWh
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Could power a home for {(recyclingImpact.energySaved / 30).toFixed(1)} days
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard sx={{ bgcolor: '#e8f5e9' }}>
            <Typography variant="h6" align="center" gutterBottom>
              CO₂ Emissions Reduced
            </Typography>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
              {recyclingImpact.co2Reduced.toFixed(1)} kg
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Equivalent to {(recyclingImpact.co2Reduced / 2.3).toFixed(1)} days not driving
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard sx={{ bgcolor: '#e8f5e9' }}>
            <Typography variant="h6" align="center" gutterBottom>
              Landfill Space Saved
            </Typography>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
              {recyclingImpact.landfilSpace.toFixed(2)} m³
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Room for nature to flourish
            </Typography>
          </StatsCard>
        </Grid>
      </Grid>
    </Box>
  );
};

// Add missing LinearProgress import
const LinearProgress = styled(Box)(({ theme, value }) => ({
  position: 'relative',
  height: 8,
  borderRadius: 4,
  backgroundColor: '#e0e0e0',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: `${value}%`,
    backgroundColor: theme.palette.primary.main,
    borderRadius: 4,
  }
}));

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [stats, setStats] = useState(null);

  // Fetch stats when first loading the app or changing to stats tab
  useEffect(() => {
    if (currentTab === 1) {
      fetchStats();
    }
  }, [currentTab]);

  // Also fetch stats after a new detection
  useEffect(() => {
    if (results) {
      fetchStats();
    }
  }, [results]);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/stats');
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleImageUpload = async (file) => {
    setLoading(true);
    console.log("Uploading file:", file.name);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/api/detect', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Detection results:", data);
      setResults(data);
      
      // Switch to detection tab to show results
      setCurrentTab(0);
    } catch (error) {
      console.error('Error:', error);
      alert(`Error processing the image: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Header currentTab={currentTab} onTabChange={handleTabChange} />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {currentTab === 0 ? (
          // Detection Tab
          <>
            <Typography variant="h3" component="h1" gutterBottom>
              Trashify - E-waste Detection
            </Typography>
            <Typography variant="body1" paragraph color="text.secondary">
              Upload an image to detect e-waste items and get recycling suggestions
            </Typography>
            
            <ImageUpload onImageUpload={handleImageUpload} loading={loading} />
            
            {loading && (
              <Box sx={{ textAlign: 'center', my: 4 }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Processing your image...
                </Typography>
              </Box>
            )}
            
            {results && <ResultsView results={results} />}
          </>
        ) : (
          // Stats Tab
          <StatsView stats={stats} />
        )}
      </Container>
    </Box>
  );
}

export default App; 