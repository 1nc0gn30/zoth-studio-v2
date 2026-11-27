import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  LinearProgress,
  Divider,
  Switch,
  FormControlLabel,
  Slider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import GitHubIcon from '@mui/icons-material/GitHub';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CalculateIcon from '@mui/icons-material/Calculate';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import {
  SovereignWorkstationShell,
  SovereignCard,
  SovereignStatusPill,
  SovereignAlertBanner,
  SovereignCodeBlock,
  SovereignGauge,
  SovereignPresetBar,
  SovereignKeyValueGrid,
  useCopy,
  downloadJson,
  downloadText,
  MONO,
  SOV,
  rgba,
} from '../sovereign';
import {
  ETSY_POD_FORGE_VERSION,
  TITLE_MAX,
  FRONTLOAD_WINDOW,
  MAX_TAGS,
  POD_CADRES,
  POD_PRESETS,
  MCP_TOOLS,
  PROMPT_VAULT_RECIPES,
  auditEtsyListing,
  normalizeTitle,
  cleanTagsList,
  calculatePodMargins,
  validateCanvasSpec,
  buildFulfillmentPayloads,
  slugify,
} from '../../utils/etsyPodForgeEngine';

export default function EtsyPodForgeGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Strictly WCAG AA (>= 5.4:1) mode-aware semantic colors for Editorial Ivory Light + Obsidian Gold Dark
  const accent = isDark ? '#FDBA74' : '#9A3412';
  const emeraldTone = isDark ? '#34D399' : '#047857';
  const amberTone = isDark ? '#FBBF24' : '#92400E';
  const crimsonTone = isDark ? '#F87171' : '#B91C1C';
  const cyberTone = isDark ? '#38BDF8' : '#0369A1';
  const goldTone = isDark ? '#E8C46A' : '#7C5B12';

  const { copied, copy } = useCopy();

  const [activePresetId, setActivePresetId] = useState(POD_PRESETS[0].id);
  const [cadreId, setCadreId] = useState(POD_PRESETS[0].cadreId);
  const [title, setTitle] = useState(POD_PRESETS[0].title);
  const [tagsText, setTagsText] = useState(POD_PRESETS[0].tags.join(', '));
  const [description, setDescription] = useState(POD_PRESETS[0].description);

  const [price, setPrice] = useState(POD_PRESETS[0].price);
  const [buyerShipping, setBuyerShipping] = useState(POD_PRESETS[0].buyerShipping);
  const [provider, setProvider] = useState(POD_PRESETS[0].provider);
  const [prodCost, setProdCost] = useState(POD_PRESETS[0].prodCost);
  const [podShipCost, setPodShipCost] = useState(POD_PRESETS[0].podShipCost);
  const [extraCost, setExtraCost] = useState(POD_PRESETS[0].extraCost);
  const [offsiteAdsRate, setOffsiteAdsRate] = useState(POD_PRESETS[0].offsiteAdsRate);
  const [payloadTab, setPayloadTab] = useState('printify');
  const [promptSearch, setPromptSearch] = useState('');

  const activeCadre = useMemo(
    () => POD_CADRES.find((c) => c.id === cadreId) || POD_CADRES[0],
    [cadreId],
  );

  const loadPreset = (preset) => {
    setActivePresetId(preset.id);
    setCadreId(preset.cadreId);
    setTitle(preset.title);
    setTagsText(preset.tags.join(', '));
    setDescription(preset.description);
    setPrice(preset.price);
    setBuyerShipping(preset.buyerShipping);
    setProvider(preset.provider);
    setProdCost(preset.prodCost);
    setPodShipCost(preset.podShipCost);
    setExtraCost(preset.extraCost);
    setOffsiteAdsRate(preset.offsiteAdsRate);
  };

  const selectCadre = (cadre) => {
    setCadreId(cadre.id);
    setPrice(cadre.defaultRetail);
    setProdCost(cadre.defaultProd);
    setPodShipCost(cadre.defaultShip);
  };

  const audit = useMemo(() => auditEtsyListing(title, tagsText), [title, tagsText]);
  const canvasSpec = useMemo(
    () => validateCanvasSpec({ cadreId: activeCadre.id, width: activeCadre.canvasWidth, height: activeCadre.canvasHeight, dpi: activeCadre.dpi }),
    [activeCadre],
  );
  const margin = useMemo(
    () =>
      calculatePodMargins({
        price,
        buyerShipping,
        prodCost,
        podShipCost,
        extraCost,
        offsiteAdsRate,
      }),
    [price, buyerShipping, prodCost, podShipCost, extraCost, offsiteAdsRate],
  );

  const { printify: printifyPayload, gelato: gelatoPayload } = useMemo(
    () =>
      buildFulfillmentPayloads({
        cadreId: activeCadre.id,
        title,
        description,
        tags: audit.tags,
        itemPrice: margin.itemPrice,
      }),
    [activeCadre.id, title, description, audit.tags, margin.itemPrice],
  );

  const filteredPrompts = useMemo(() => {
    const q = promptSearch.trim().toLowerCase();
    return PROMPT_VAULT_RECIPES.filter((r) => {
      if (q) {
        return (
          r.title.toLowerCase().includes(q) ||
          r.prompt.toLowerCase().includes(q) ||
          r.cadre.toLowerCase().includes(q)
        );
      }
      return r.cadre === cadreId;
    });
  }, [cadreId, promptSearch]);

  const handleFixTitleCase = () => setTitle(normalizeTitle(title));
  const handleCleanTags = () => setTagsText(cleanTagsList(tagsText).join(', '));
  const removeTagAt = (idx) => setTagsText(audit.tags.filter((_, i) => i !== idx).join(', '));

  const formattedListingText = useMemo(() => {
    const tagList = audit.tags.slice(0, MAX_TAGS).join(', ');
    return `ETSY POD FORGE v${ETSY_POD_FORGE_VERSION} LISTING PACK — ${activeCadre.name}

TITLE (${audit.titleLen}/${TITLE_MAX} chars):
${title.trim()}

13 SEARCH TAGS (${audit.tags.length}/${MAX_TAGS}):
${tagList}

300-DPI PRINT SPEC:
- Cadre: ${activeCadre.id} (${activeCadre.productType})
- Master Canvas: ${canvasSpec.targetSpec} (${canvasSpec.printInches})
- Printify: Blueprint #${activeCadre.printifyBlueprintId} / Provider #${activeCadre.printifyProviderId}
- Gelato v4 UID: ${activeCadre.gelatoUid}

2026 MARGIN SUMMARY:
- Retail Price: $${margin.itemPrice.toFixed(2)} (+ $${margin.shipCharged.toFixed(2)} buyer ship)
- Total Etsy Fees: $${margin.totalEtsyFees.toFixed(2)} (${margin.feePctOfRev.toFixed(1)}%)
- POD COGS (${provider.toUpperCase()}): $${margin.totalCogs.toFixed(2)}
- Net Profit: $${margin.netProfit.toFixed(2)} (${margin.netMarginPct.toFixed(1)}% net margin)
- Break-Even Price: $${margin.breakEvenGross.toFixed(2)}

DESCRIPTION:
${description.trim()}
`;
  }, [activeCadre, canvasSpec, title, audit, margin, provider, description]);

  const listingPackJson = useMemo(
    () => ({
      schema: 'zoth.etsy_pod_forge.listing_pack.v2.6',
      version: ETSY_POD_FORGE_VERSION,
      cadre: activeCadre,
      canvas_spec: canvasSpec,
      seo_audit: {
        score: audit.score,
        tier: audit.tier,
        title_chars: audit.titleLen,
        tag_count: audit.tags.length,
        over_20_char_tags: audit.over20Count,
        multi_word_tags: audit.multiWordCount,
        title_tag_overlap: audit.overlapCount,
        recommended_fixes: audit.fixes,
      },
      etsy_listing: {
        title: title.trim(),
        tags: audit.tags.slice(0, MAX_TAGS),
        price_usd: Number(margin.itemPrice.toFixed(2)),
        buyer_shipping_usd: Number(margin.shipCharged.toFixed(2)),
        description: description.trim(),
      },
      margin_2026: margin,
      fulfillment: {
        selected_provider: provider,
        printify_draft: printifyPayload,
        gelato_draft: gelatoPayload,
      },
    }),
    [activeCadre, canvasSpec, audit, title, margin, description, provider, printifyPayload, gelatoPayload],
  );

  const activeCodeContent = useMemo(() => {
    if (payloadTab === 'printify') return JSON.stringify(printifyPayload, null, 2);
    if (payloadTab === 'gelato') return JSON.stringify(gelatoPayload, null, 2);
    if (payloadTab === 'pack') return JSON.stringify(listingPackJson, null, 2);
    return formattedListingText;
  }, [payloadTab, printifyPayload, gelatoPayload, listingPackJson, formattedListingText]);

  const kpis = [
    {
      label: 'Etsy SEO Score',
      value: `${audit.score}/100`,
      unit: audit.tier,
      accent: audit.score >= 85 ? emeraldTone : audit.score >= 60 ? amberTone : crimsonTone,
    },
    {
      label: 'Net Profit / Order',
      value: `${margin.netProfit < 0 ? '-' : ''}$${Math.abs(margin.netProfit).toFixed(2)}`,
      unit: `${margin.netMarginPct.toFixed(1)}% net margin`,
      accent: margin.netProfit > 0 ? emeraldTone : crimsonTone,
    },
    {
      label: '2026 Etsy Fees',
      value: `$${margin.totalEtsyFees.toFixed(2)}`,
      unit: `${margin.feePctOfRev.toFixed(1)}% of rev`,
      accent,
    },
    {
      label: '300-DPI Print Plate',
      value: `${activeCadre.canvasWidth}×${activeCadre.canvasHeight}`,
      unit: `${canvasSpec.printInches} · 300 DPI`,
      accent: cyberTone,
    },
  ];

  const statusNode = (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
      <SovereignStatusPill
        status={audit.score >= 75 && margin.netProfit > 0 ? 'online' : 'standby'}
        label={`SEO ${audit.score}/100 (${audit.tier}) · NET ${margin.netProfit >= 0 ? '+' : '-'}$${Math.abs(margin.netProfit).toFixed(2)}`}
        accent={accent}
        sx={{ maxWidth: '100%', '& .MuiTypography-root': { whiteSpace: 'normal', lineHeight: 1.25 } }}
      />
    </Box>
  );

  const actions = [
    {
      label: 'Download etsy-listing-pack.json',
      icon: <DownloadIcon fontSize="small" />,
      onClick: () => downloadJson(listingPackJson, `etsy-pod-${activeCadre.id}-pack.json`),
      primary: true,
    },
    {
      label: copied === 'desc' ? 'Copied Listing Pack' : 'Copy Formatted Listing',
      icon: copied === 'desc' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />,
      onClick: () => copy(formattedListingText, 'desc'),
    },
    {
      label: 'Download Listing .txt',
      icon: <DownloadIcon fontSize="small" />,
      onClick: () => downloadText(formattedListingText, `${slugify(title)}-etsy.txt`, 'text/plain;charset=utf-8'),
    },
    {
      label: 'etsy-pod-forge on GitHub',
      icon: <GitHubIcon fontSize="small" />,
      href: 'https://github.com/1nc0gn30/etsy-pod-forge',
    },
  ];

  const leftPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="01"
        eyebrow="ETSY POD FORGE · 5 CADRES & SEO AUDITOR"
        title="140-Char Title & 13-Tag SEO Inspector"
        subtitle="Validates 40-char front-loaded keyword window, separator hygiene, 20-char tag ceiling, long-tail density, and stem uniqueness"
        accent={accent}
      >
        <Box sx={{ mb: 2 }}>
          <SovereignPresetBar
            presets={POD_PRESETS}
            activeId={activePresetId}
            onSelect={loadPreset}
            onReset={() => loadPreset(POD_PRESETS[0])}
            accent={accent}
          />
        </Box>

        {/* Title Editor (Explicitly Labeled for WCAG A11y) */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75, flexWrap: 'wrap', gap: 0.5 }}>
            <Typography component="span" sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: 'text.secondary' }}>
              TITLE METER (MAX {TITLE_MAX} CHARS)
            </Typography>
            <Typography
              component="span"
              sx={{
                fontFamily: MONO,
                fontSize: '0.74rem',
                fontWeight: 700,
                color: audit.titleLen > TITLE_MAX ? crimsonTone : audit.titleLen >= 90 ? emeraldTone : amberTone,
              }}
            >
              {audit.titleLen} / {TITLE_MAX}
            </Typography>
          </Box>
          <TextField
            id="etsy-pod-title-input"
            label="Etsy Listing Title (max 140 chars)"
            multiline
            minRows={2}
            fullWidth
            size="small"
            error={audit.titleLen > TITLE_MAX}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Front-load your primary buyer keyword in the first 40 characters..."
            inputProps={{ 'aria-label': 'Etsy Listing Title' }}
            sx={{ '& textarea': { fontFamily: MONO, fontSize: '0.8rem', lineHeight: 1.5 } }}
          />
          <LinearProgress
            variant="determinate"
            value={Math.min(100, (audit.titleLen / TITLE_MAX) * 100)}
            sx={{
              mt: 0.75,
              height: 5,
              borderRadius: 3,
              bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(16,24,40,0.08)',
              '& .MuiLinearProgress-bar': {
                bgcolor: audit.titleLen > TITLE_MAX ? crimsonTone : audit.titleLen >= 90 ? emeraldTone : amberTone,
              },
            }}
          />

          <Box
            sx={{
              mt: 1,
              p: 1,
              borderRadius: 1.25,
              border: '1px dashed',
              borderColor: rgba(accent, 0.45),
              bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(16,24,40,0.03)',
            }}
          >
            <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: 'text.secondary', mb: 0.35 }}>
              MOBILE SEARCH SNIPPET (FIRST 40 CHARS HIGHLIGHTED):
            </Typography>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', wordBreak: 'break-word' }}>
              <Box component="span" sx={{ color: accent, fontWeight: 700, textDecoration: 'underline' }}>
                {title.slice(0, FRONTLOAD_WINDOW) || '(empty)'}
              </Box>
              <Box component="span" sx={{ color: 'text.secondary' }}>
                {title.slice(FRONTLOAD_WINDOW, TITLE_MAX)}
              </Box>
              {title.length > TITLE_MAX && (
                <Box component="span" sx={{ color: crimsonTone, fontWeight: 700, bgcolor: rgba(crimsonTone, 0.14) }}>
                  {title.slice(TITLE_MAX)}
                </Box>
              )}
            </Typography>
          </Box>
        </Box>

        {/* 13 Tags Editor (Explicitly Labeled for WCAG A11y) */}
        <Box sx={{ mb: 1.75 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75, flexWrap: 'wrap', gap: 0.5 }}>
            <Typography component="span" sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: 'text.secondary' }}>
              SEARCH TAGS (&lt;= 20 CHARS EACH)
            </Typography>
            <Typography
              component="span"
              sx={{
                fontFamily: MONO,
                fontSize: '0.74rem',
                fontWeight: 700,
                color: audit.tags.length === MAX_TAGS && audit.over20Count === 0 ? emeraldTone : amberTone,
              }}
            >
              {audit.tags.length} / {MAX_TAGS} TAGS
            </Typography>
          </Box>
          <TextField
            id="etsy-pod-tags-input"
            label="13 Etsy Search Tags (comma or newline separated)"
            multiline
            minRows={3}
            fullWidth
            size="small"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="grandma sweatshirt, gardener gift, wildflower sweater..."
            inputProps={{ 'aria-label': '13 Etsy Search Tags' }}
            sx={{ '& textarea': { fontFamily: MONO, fontSize: '0.78rem', lineHeight: 1.5 } }}
          />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.25 }}>
            {audit.tagDetails.map((tag, idx) => {
              const bad = tag.over20 || idx >= MAX_TAGS;
              const warn = !bad && (!tag.multiWord || tag.repeatedStems.length > 0);
              const chipTone = bad ? crimsonTone : warn ? amberTone : emeraldTone;
              return (
                <Chip
                  key={`${tag.text}-${idx}`}
                  icon={<LocalOfferIcon sx={{ fontSize: '14px !important', color: `${chipTone} !important` }} />}
                  label={`${tag.text} (${tag.len}/20)`}
                  onDelete={() => removeTagAt(idx)}
                  sx={{
                    minHeight: { xs: 44, md: 32 },
                    fontFamily: MONO,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    bgcolor: rgba(chipTone, isDark ? 0.14 : 0.1),
                    color: isDark ? '#F5F1E6' : '#101828',
                    border: `1px solid ${rgba(chipTone, 0.48)}`,
                  }}
                />
              );
            })}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AutoFixHighIcon fontSize="small" />}
            onClick={handleFixTitleCase}
            sx={{ minHeight: 44, fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, textTransform: 'none', color: accent, borderColor: rgba(accent, 0.5) }}
          >
            Normalize Title Case &amp; Trim &lt;=140
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AutoFixHighIcon fontSize="small" />}
            onClick={handleCleanTags}
            sx={{ minHeight: 44, fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, textTransform: 'none', color: cyberTone, borderColor: rgba(cyberTone, 0.5) }}
          >
            Dedupe &amp; Cap Tags &lt;=20 Chars
          </Button>
        </Box>
      </SovereignCard>

      <SovereignCard
        index="02"
        eyebrow="5 CANONICAL POD CADRES & 2026 MARGIN ENGINE"
        title="Cadre Blueprint, Offsite Ads & Break-Even Calculator"
        subtitle="$0.20 listing + 6.5% transaction (item+ship) + 3%+$0.25 US payment + 0%/12%/15% Offsite Ads"
        accent={emeraldTone}
      >
        <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
          ETSY POD FORGE CADRES (REAL PRINTIFY &amp; GELATO v4 IDS)
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
          {POD_CADRES.map((c) => {
            const active = c.id === cadreId;
            return (
              <Chip
                key={c.id}
                label={c.label}
                clickable
                onClick={() => selectCadre(c)}
                sx={{
                  minHeight: 44,
                  fontFamily: MONO,
                  fontSize: '0.72rem',
                  fontWeight: active ? 700 : 600,
                  bgcolor: active ? rgba(emeraldTone, 0.14) : 'transparent',
                  color: active ? emeraldTone : 'text.primary',
                  border: `1px solid ${active ? emeraldTone : 'rgba(148,163,184,0.38)'}`,
                }}
              />
            );
          })}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mb: 2 }}>
          <TextField size="small" type="number" label="Item Price ($)" value={price} onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))} inputProps={{ min: 0, step: 0.5 }} sx={{ flex: '1 1 120px', '& input': { fontFamily: MONO } }} />
          <TextField size="small" type="number" label="Buyer Shipping ($)" value={buyerShipping} onChange={(e) => setBuyerShipping(Math.max(0, Number(e.target.value)))} inputProps={{ min: 0, step: 0.5 }} sx={{ flex: '1 1 120px', '& input': { fontFamily: MONO } }} />
          <TextField size="small" type="number" label="POD Base Cost ($)" value={prodCost} onChange={(e) => setProdCost(Math.max(0, Number(e.target.value)))} inputProps={{ min: 0, step: 0.25 }} sx={{ flex: '1 1 120px', '& input': { fontFamily: MONO } }} />
          <TextField size="small" type="number" label="POD Ship Cost ($)" value={podShipCost} onChange={(e) => setPodShipCost(Math.max(0, Number(e.target.value)))} inputProps={{ min: 0, step: 0.25 }} sx={{ flex: '1 1 120px', '& input': { fontFamily: MONO } }} />
          <TextField size="small" type="number" label="Extra / Pack ($)" value={extraCost} onChange={(e) => setExtraCost(Math.max(0, Number(e.target.value)))} inputProps={{ min: 0, step: 0.25 }} sx={{ flex: '1 1 120px', '& input': { fontFamily: MONO } }} />
        </Box>

        <Box sx={{ mb: 1.75 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary' }}>
              QUICK RETAIL PRICE TUNER
            </Typography>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.78rem', fontWeight: 700, color: accent }}>
              ${margin.itemPrice.toFixed(2)}
            </Typography>
          </Box>
          <Slider
            value={Math.min(180, margin.itemPrice)}
            min={8}
            max={180}
            step={1}
            onChange={(_, v) => setPrice(Number(v))}
            aria-label="Retail Price"
            sx={{ color: accent }}
          />
        </Box>

        <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
          ETSY OFFSITE ADS ATTRIBUTION TIER
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.85, mb: 1.75 }}>
          {[
            { rate: 0, label: 'Organic (0%)' },
            { rate: 0.12, label: 'Offsite Ads 12% (>=$10k/yr)' },
            { rate: 0.15, label: 'Offsite Ads 15% (<$10k/yr)' },
          ].map((opt) => {
            const active = offsiteAdsRate === opt.rate;
            return (
              <Chip
                key={opt.label}
                label={opt.label}
                clickable
                onClick={() => setOffsiteAdsRate(opt.rate)}
                sx={{
                  minHeight: 44,
                  fontFamily: MONO,
                  fontSize: '0.72rem',
                  fontWeight: active ? 700 : 600,
                  bgcolor: active ? rgba(accent, 0.14) : 'transparent',
                  color: active ? accent : 'text.primary',
                  border: `1px solid ${active ? accent : 'rgba(148,163,184,0.38)'}`,
                }}
              />
            );
          })}
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={buyerShipping === 0}
              onChange={(e) => setBuyerShipping(e.target.checked ? 0 : 4.99)}
              size="small"
            />
          }
          label={
            <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: 'text.secondary' }}>
              Free Shipping Guarantee ($0 buyer ship; POD shipping absorbed in margin)
            </Typography>
          }
        />
      </SovereignCard>
    </Box>
  );

  const rightPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="03"
        eyebrow="LIVE SCORE & ACTIONABLE FIX CHIPS"
        title="Etsy SEO Score & Diagnostic Matrix"
        subtitle="Deterministic 100-point score across title front-loading, tag limits, long-tail density, and stem uniqueness"
        accent={accent}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 2 }}>
          <SovereignGauge
            value={audit.score}
            max={100}
            label="ETSY SEO"
            unit="%"
            status={audit.tier}
            thresholds={{ warn: 75, danger: 55 }}
            invertThresholds
          />
          <Box sx={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {audit.checks.map((c) => (
              <Box key={c.label} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
                {c.ok ? (
                  <CheckCircleOutlineIcon sx={{ fontSize: 16, color: emeraldTone, mt: 0.15, flexShrink: 0 }} />
                ) : (
                  <WarningAmberIcon sx={{ fontSize: 16, color: amberTone, mt: 0.15, flexShrink: 0 }} />
                )}
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700 }}>
                    {c.label} · {c.pts}/{c.max}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: 1.35 }}>
                    {c.detail}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary', mb: 0.85 }}>
          ACTIONABLE FIX CHIPS ({audit.fixes.length})
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {audit.fixes.length === 0 ? (
            <Chip
              icon={<CheckCircleOutlineIcon sx={{ fontSize: '15px !important', color: `${emeraldTone} !important` }} />}
              label="All Etsy 2026 Title & 13-Tag Ranking Checks Passed"
              sx={{
                minHeight: 44,
                fontFamily: MONO,
                fontSize: '0.72rem',
                fontWeight: 700,
                bgcolor: rgba(emeraldTone, 0.12),
                color: emeraldTone,
                border: `1px solid ${rgba(emeraldTone, 0.45)}`,
              }}
            />
          ) : (
            audit.fixes.map((fix, idx) => (
              <Chip
                key={idx}
                icon={<WarningAmberIcon sx={{ fontSize: '14px !important', color: `${amberTone} !important` }} />}
                label={fix}
                sx={{
                  minHeight: 44,
                  fontFamily: MONO,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  bgcolor: rgba(amberTone, 0.12),
                  color: isDark ? '#F5F1E6' : '#101828',
                  border: `1px solid ${rgba(amberTone, 0.45)}`,
                  height: 'auto',
                  py: 0.6,
                  '& .MuiChip-label': { whiteSpace: 'normal' },
                }}
              />
            ))
          )}
        </Box>
      </SovereignCard>

      <SovereignCard
        index="04"
        eyebrow="2026 FEE WATERFALL, 300-DPI SPEC & BREAK-EVEN"
        title="Order Economics & Master Print Plate"
        subtitle={`${activeCadre.name} · Printify BP #${activeCadre.printifyBlueprintId} / Provider #${activeCadre.printifyProviderId} · ${canvasSpec.targetSpec}`}
        accent={emeraldTone}
        right={<CalculateIcon sx={{ color: emeraldTone }} />}
      >
        <SovereignKeyValueGrid
          cols={3}
          accent={emeraldTone}
          items={[
            { label: 'Gross Revenue', value: `$${margin.grossRevenue.toFixed(2)}`, badge: 'Item+Ship' },
            { label: 'Listing Fee', value: `$${margin.listingFee.toFixed(2)}`, badge: 'Flat' },
            { label: 'Transaction (6.5%)', value: `$${margin.transactionFee.toFixed(2)}`, badge: 'Etsy' },
            { label: 'Payment (3%+$0.25)', value: `$${margin.paymentProcessingFee.toFixed(2)}`, badge: 'US Pay' },
            { label: `Offsite Ads (${Math.round(offsiteAdsRate * 100)}%)`, value: `$${margin.offsiteAdsFee.toFixed(2)}`, badge: offsiteAdsRate > 0 ? 'Active' : 'Off' },
            { label: 'Total POD COGS', value: `$${margin.totalCogs.toFixed(2)}`, badge: provider.toUpperCase() },
            { label: 'Net Profit', value: `${margin.netProfit < 0 ? '-' : ''}$${Math.abs(margin.netProfit).toFixed(2)} (${margin.netMarginPct.toFixed(1)}%)`, badge: margin.netProfit > 0 ? 'PROFIT' : 'LOSS' },
            { label: 'Break-Even Price', value: `$${margin.breakEvenGross.toFixed(2)}`, badge: '0% Net' },
            { label: 'Target 30% Net Price', value: `$${margin.target30MarginGross.toFixed(2)}`, badge: 'Recommended' },
          ]}
        />
      </SovereignCard>

      <SovereignCard
        index="05"
        eyebrow="PRINTIFY v1 / GELATO v4 PAYLOADS, PROMPT VAULT & 6 MCP TOOLS"
        title="Fulfillment Payloads, Prompt Vault & Local MCP"
        subtitle="Uses each cadre's real Printify blueprint/provider ID and Gelato v4 UID plus curated recipes and 6 stdio MCP tools"
        accent={accent}
        right={
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.65 }}>
            {[
              { id: 'printify', label: 'Printify v1' },
              { id: 'gelato', label: 'Gelato v4' },
              { id: 'pack', label: 'Pack JSON' },
              { id: 'text', label: 'Listing Copy' },
            ].map((tab) => {
              const active = payloadTab === tab.id;
              return (
                <Chip
                  key={tab.id}
                  label={tab.label}
                  clickable
                  onClick={() => {
                    setPayloadTab(tab.id);
                    if (tab.id === 'printify' || tab.id === 'gelato') setProvider(tab.id);
                  }}
                  sx={{
                    minHeight: 44,
                    fontFamily: MONO,
                    fontSize: '0.7rem',
                    fontWeight: active ? 700 : 600,
                    bgcolor: active ? rgba(accent, 0.14) : 'transparent',
                    color: active ? accent : 'text.primary',
                    border: `1px solid ${active ? accent : 'rgba(148,163,184,0.38)'}`,
                  }}
                />
              );
            })}
          </Box>
        }
      >
        <TextField
          id="etsy-pod-desc-input"
          multiline
          minRows={3}
          fullWidth
          size="small"
          label="Listing Description (synced into Printify/Gelato payloads & export)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ mb: 1.5, '& textarea': { fontFamily: MONO, fontSize: '0.78rem', lineHeight: 1.55 } }}
        />

        <SovereignCodeBlock
          title={
            payloadTab === 'printify'
              ? 'printify-draft-payload.json'
              : payloadTab === 'gelato'
              ? 'gelato-draft-payload.json'
              : payloadTab === 'pack'
              ? 'etsy-listing-pack.json'
              : 'etsy-listing-copy.txt'
          }
          badge={payloadTab === 'text' ? 'TEXT' : 'JSON'}
          code={activeCodeContent}
          filename={payloadTab === 'text' ? 'etsy-listing-copy.txt' : `${payloadTab}-etsy-payload.json`}
          accent={accent}
          maxHeight={260}
        />

        <Divider sx={{ my: 2 }} />

        <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: 'text.secondary', mb: 1 }}>
          CURATED 53-RECIPE PROMPT VAULT ({activeCadre.id.toUpperCase()} PREVIEW · SEARCH ALL)
        </Typography>
        <TextField
          id="etsy-pod-prompt-search"
          size="small"
          fullWidth
          label="Search Prompt Vault (e.g., wildflower, cardinal, quilt)"
          value={promptSearch}
          onChange={(e) => setPromptSearch(e.target.value)}
          sx={{ mb: 1.25 }}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          {filteredPrompts.map((rec) => (
            <Box
              key={rec.id}
              sx={{
                p: 1.25,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(16,24,40,0.02)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 1.25,
                flexWrap: 'wrap',
              }}
            >
              <Box sx={{ flex: '1 1 260px', minWidth: 0 }}>
                <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 700, color: accent }}>
                  [{rec.id}] {rec.title} (--ar {rec.ratio})
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', mt: 0.25 }}>
                  {rec.prompt}
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                onClick={() => copy(rec.prompt, rec.id)}
                sx={{ minHeight: 44, fontFamily: MONO, fontSize: '0.72rem', color: accent, borderColor: rgba(accent, 0.45), textTransform: 'none' }}
              >
                {copied === rec.id ? 'Copied' : 'Copy Recipe'}
              </Button>
            </Box>
          ))}
        </Box>

        <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: 'text.secondary', mb: 1 }}>
          6 NATIVE ETSY-POD-FORGE STDIO MCP TOOLS (`etsy-pod-forge mcp`)
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
          {MCP_TOOLS.map((t) => (
            <Chip
              key={t.name}
              label={t.name}
              sx={{
                minHeight: 36,
                fontFamily: MONO,
                fontSize: '0.7rem',
                fontWeight: 700,
                bgcolor: rgba(goldTone, 0.12),
                color: goldTone,
                border: `1px solid ${rgba(goldTone, 0.4)}`,
              }}
            />
          ))}
        </Box>

        <SovereignCodeBlock
          title="LOCAL DAEMON (:8107), CLI & 6-TOOL MCP SERVER"
          badge="CLI / MCP"
          code={`# Start local 300-DPI Canvas, Mockup & ZIP Forge daemon (127.0.0.1:8107)\netsy-pod-forge serve --port 8107\netsy-pod-forge --status\n\n# Synthesize compliant listing JSON (0%/12%/15% Offsite Ads)\netsy-pod-forge listing --cadre ${activeCadre.id} --offsite-ads-rate ${offsiteAdsRate} --json\n\n# Launch 6-tool JSON-RPC 2.0 stdio MCP server\netsy-pod-forge mcp`}
          filename="etsy-pod-forge-cli.sh"
          accent={goldTone}
        />
      </SovereignCard>
    </Box>
  );

  return (
    <Box sx={{ width: '100%', minWidth: 0 }} data-testid="etsy-pod-forge-workstation">
      <Box sx={{ mb: 2 }}>
        <SovereignAlertBanner
          severity="info"
          title="Runtime Scope · Browser SEO/Margin Deck + Local :8107 300-DPI Canvas/Mockup/ZIP Forge"
          message="All 140-char/13-tag SEO diagnostics, 2026 fee & Offsite Ads math, Printify v1 / Gelato v4 payload builders, and Prompt Vault lookups run locally in your browser with zero remote API calls. Local 300-DPI RGBA Pillow canvas rendering, 1400px lifestyle mockup compositing, Master ZIP Kit export, and 6 stdio MCP tools run on loopback 127.0.0.1:8107 (live Etsy Open API v3 draft publishing is handled separately by companion etsy-connector on :8108)."
        />
      </Box>
      <SovereignWorkstationShell
        id="etsy-pod-forge"
        category="COMMERCE & POD · 5 CADRES · 6 MCP TOOLS (:8107)"
        title="Etsy POD Forge & 13-Tag SEO Workstation"
        subtitle="300-DPI Print Canvas specs across 5 cadres, 140-character & 13-tag SEO auditor, exact 2026 Etsy fee & 0%/12%/15% Offsite Ads margin calculator, curated 53-recipe Prompt Vault, and Printify v1 / Gelato v4 payload builder."
        version={ETSY_POD_FORGE_VERSION}
        variant="hex-lattice"
        accent={accent}
        metrics={kpis}
        status={statusNode}
        actions={actions}
        leftPane={leftPane}
        rightPane={rightPane}
        leftCols={5}
        rightCols={7}
      />
    </Box>
  );
}
