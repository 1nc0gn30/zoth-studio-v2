import React, { useState } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, CardActions,
  Chip, Button, TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GitHubIcon from '@mui/icons-material/GitHub';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TerminalIcon from '@mui/icons-material/Terminal';
import { microTools } from '../data/toolsData';

const categories = ['All', 'Swarm & Core', 'Security & Recon', 'Autonomous Web', 'Media & 3D', 'AI & Knowledge', 'Developer Tools', 'Automation'];

export default function ToolsPage() {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (pullCmd, id) => {
    navigator.clipboard.writeText(pullCmd);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = microTools.filter((t) => {
    const matchesCat = selectedCat === 'All' || t.category === selectedCat;
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.repo.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Chip
          icon={<TerminalIcon sx={{ color: '#B8860B !important' }} />}
          label="28 MICRO-REPOSITORIES CATALOG"
          size="small"
          sx={{ bg: '#FEF9E7', color: '#B8860B', border: '1px solid #F0E1A8', fontWeight: 700, mb: 1, px: 1 }}
        />
        <Typography variant="h3" sx={{ mb: 1 }}>
          Tool Nexus Sovereign Repositories
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Every tool in Zoth Studio is its own standalone GitHub repository under <code style={{ color: '#B8860B' }}>NullAITech</code>. Discover, pull with <code style={{ color: '#B8860B' }}>npx zoth pull &lt;repo&gt;</code>, or open the source repository on GitHub.
        </Typography>
      </Box>

      {/* Filter & Search Bar */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            placeholder="Search 28 micro-tools by name, category, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#B8860B' }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel id="category-select-label">Category</InputLabel>
            <Select
              labelId="category-select-label"
              value={selectedCat}
              label="Category"
              onChange={(e) => setSelectedCat(e.target.value)}
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Tools Counter */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Showing <strong>{filtered.length}</strong> of <strong>{microTools.length}</strong> micro-tool repositories
      </Typography>

      {/* Tools Grid */}
      <Grid container spacing={3}>
        {filtered.map((tool) => (
          <Grid item xs={12} sm={6} md={4} key={tool.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                border: '1px solid #EAECF0',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: '#D4AF37',
                  boxShadow: '0 8px 24px rgba(212, 175, 55, 0.15)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Chip label={tool.category} size="small" sx={{ bg: '#FEF9E7', color: '#B8860B', fontWeight: 600, fontSize: '0.75rem' }} />
                  <Chip label={`v${tool.version}`} size="small" variant="outlined" sx={{ color: '#667085', fontSize: '0.75rem' }} />
                </Box>
                <Typography variant="h6" sx={{ color: '#101828', mb: 1, fontWeight: 700 }}>
                  {tool.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                  {tool.description}
                </Typography>
                <Box sx={{ bg: '#F9FAFB', p: 1.5, borderRadius: 1, border: '1px dashed #EAECF0', fontFamily: 'monospace', fontSize: '0.8rem', color: '#B8860B' }}>
                  {tool.pull}
                </Box>
              </CardContent>
              <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: 'space-between', borderTop: '1px solid #EAECF0' }}>
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  startIcon={<ContentCopyIcon />}
                  onClick={() => handleCopy(tool.pull, tool.id)}
                >
                  {copiedId === tool.id ? 'Copied!' : 'Copy CLI'}
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  href={tool.github}
                  target="_blank"
                  startIcon={<GitHubIcon />}
                >
                  Repo
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

    </Container>
  );
}
