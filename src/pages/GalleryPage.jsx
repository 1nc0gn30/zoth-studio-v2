import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SEO from '../components/SEO';
import { galleryGroups } from '../data/galleryManifest';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

function Frame({ label, image, video, narrow }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold = isDark ? '#D4AF37' : '#B8860B';
  const muted = theme.palette.text.secondary;

  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{
          fontFamily: mono,
          fontSize: '0.72rem',
          fontWeight: 800,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: gold,
          mb: 1,
        }}
      >
        {label}
      </Typography>
      <Box
        component="img"
        src={image}
        alt={`${label} screenshot`}
        loading="lazy"
        sx={{
          display: 'block',
          width: narrow ? 'min(100%, 280px)' : '100%',
          mx: narrow ? 'auto' : 0,
          height: 'auto',
          borderRadius: 1.5,
          bgcolor: '#000',
          border: `1px solid ${theme.palette.divider}`,
        }}
      />
      <Box
        component="video"
        controls
        playsInline
        preload="none"
        poster={image}
        src={video}
        sx={{
          display: 'block',
          width: narrow ? 'min(100%, 280px)' : '100%',
          mx: narrow ? 'auto' : 0,
          mt: 1.25,
          borderRadius: 1.5,
          bgcolor: '#000',
          border: `1px solid ${theme.palette.divider}`,
        }}
      />
      <Typography sx={{ mt: 0.75, fontFamily: mono, fontSize: '0.72rem', color: muted }}>
        Intro recording
      </Typography>
    </Box>
  );
}

function CaptureCard({ item }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const border = isDark ? 'rgba(212,175,55,0.28)' : 'rgba(184,134,11,0.28)';
  const panel = isDark ? '#0D0E15' : theme.palette.background.paper;

  return (
    <Box
      component="article"
      id={item.slug}
      sx={{
        border: `1px solid ${border}`,
        borderRadius: 2,
        bgcolor: panel,
        p: { xs: 2, md: 2.5 },
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', mb: 2 }}
      >
        <Box>
          <Typography variant="h4" sx={{ color: theme.palette.text.primary }}>
            {item.title}
          </Typography>
          <Typography sx={{ fontFamily: mono, fontSize: '0.82rem', color: theme.palette.text.secondary, mt: 0.5 }}>
            {item.path}
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          to={item.path}
          variant="outlined"
          color="primary"
          sx={{ fontWeight: 750, alignSelf: { xs: 'flex-start', sm: 'center' } }}
        >
          Open route
        </Button>
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.4fr) minmax(220px, 0.6fr)' },
          gap: { xs: 3, md: 2.5 },
        }}
      >
        <Frame label="Desktop" image={item.desktopImage} video={item.desktopVideo} />
        <Frame label="Mobile" image={item.mobileImage} video={item.mobileVideo} narrow />
      </Box>
    </Box>
  );
}

export default function GalleryPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold = isDark ? '#D4AF37' : '#B8860B';

  return (
    <Container maxWidth="lg" className="page-fade-in" sx={{ py: { xs: 4, md: 7 } }}>
      <SEO
        title="Studio Gallery // Pages and Motion Intros"
        description="Desktop and mobile screenshots and intro recordings of Zoth Studio v2, including nested documentation routes."
        path="/gallery"
      />
      <Typography
        sx={{
          fontFamily: mono,
          fontSize: '0.75rem',
          fontWeight: 800,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: gold,
          mb: 1.5,
        }}
      >
        Studio gallery
      </Typography>
      <Typography variant="h2" sx={{ color: theme.palette.text.primary, mb: 2, maxWidth: 720 }}>
        What Zoth Studio looks like
      </Typography>
      <Typography sx={{ maxWidth: 680, fontSize: { xs: '1.02rem', md: '1.12rem' }, lineHeight: 1.7, color: theme.palette.text.primary, mb: 1.5 }}>
        Screenshots of the live pages, plus screen recordings of the motion intros, on desktop and on a phone-width viewport. Captured in the dark theme. Nested docs such as /adytum/docs play that section’s intro.
      </Typography>
      <Typography sx={{ fontFamily: mono, fontSize: '0.8rem', color: theme.palette.text.secondary, mb: 5 }}>
        Files are in public/studio-captures/
      </Typography>

      <Stack spacing={6}>
        {galleryGroups.map((group) => (
          <Box key={group.id} component="section">
            <Typography variant="h3" sx={{ color: theme.palette.text.primary, mb: 1 }}>
              {group.title}
            </Typography>
            <Typography sx={{ maxWidth: 720, color: theme.palette.text.secondary, mb: 3, lineHeight: 1.7 }}>
              {group.lede}
            </Typography>
            <Stack spacing={3}>
              {group.items.map((item) => (
                <CaptureCard key={item.slug} item={item} />
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Container>
  );
}
