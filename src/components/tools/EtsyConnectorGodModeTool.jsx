import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  Divider,
  Slider,
  MenuItem,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import GitHubIcon from '@mui/icons-material/GitHub';
import RefreshIcon from '@mui/icons-material/Refresh';
import KeyIcon from '@mui/icons-material/Key';
import CodeIcon from '@mui/icons-material/Code';
import SpeedIcon from '@mui/icons-material/Speed';
import StorefrontIcon from '@mui/icons-material/Storefront';
import {
  SovereignWorkstationShell,
  SovereignCard,
  SovereignStatusPill,
  SovereignAlertBanner,
  SovereignCodeBlock,
  SovereignPresetBar,
  SovereignGauge,
  SovereignDataTable,
  SovereignKeyValueGrid,
  useCopy,
  downloadJson,
  MONO,
  SOV,
  rgba,
} from '../sovereign';
import {
  ETSY_CONNECTOR_VERSION,
  ETSY_QPS_LIMIT,
  ETSY_QPD_LIMIT,
  ETSY_OAUTH_SCOPES,
  REST_ENDPOINTS,
  TAXONOMY_CATALOG,
  PRINTIFY_BLUEPRINTS,
  GELATO_PRODUCTS,
  MCP_TOOLS,
  derivePkceChallenge,
  generateVerifierString,
  generateStateNonce,
  auditListing,
  calculateProfit,
  generatePodPayload,
  buildMcpBundle,
  analyzeQuota,
} from '../../utils/etsyConnectorEngine';

const DEFAULT_VERIFIER = 'zoth_etsy_pkce_v3_9f8e7d6c5b4a3210_RFC7636_S256_verifier_token_01';

export default function EtsyConnectorGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // High-contrast WCAG AA tokens (>= 6.4:1 Light Mode on #FFF/#FAF8F2; >= 8.5:1 Dark Mode)
  const accent = isDark ? '#FDBA74' : '#9A3412';
  const secondaryAccent = isDark ? '#7DD3FC' : '#0369A1';
  const goldAccent = isDark ? '#E8C46A' : '#7A5808';
  const emeraldAccent = isDark ? '#6EE7B7' : '#065F46';
  const dangerAccent = isDark ? '#FCA5A5' : '#991B1B';
  const { copied, copy } = useCopy();

  // Primary Interactive Workbench Tabs: SEO | Fees | POD | MCP | REST
  const [workbenchMode, setWorkbenchMode] = useState('seo');

  // 13-Tag SEO Auditor State
  const [seoTitle, setSeoTitle] = useState(
    'Botanical Wildflower Heavy Blend Crewneck Sweatshirt, Cottagecore Floral Gift, Garment Dyed Pullover'
  );
  const [seoTagsText, setSeoTagsText] = useState(
    'wildflower crewneck, botanical sweatshirt, cottagecore gift, floral pullover, garden lover gift, nature crewneck, cozy floral shirt, spring botanical, pressed flower art, embroidered look, comfort colors 1717, gift for gardener, aesthetic sweater'
  );
  const [seoDesc, setSeoDesc] = useState(
    'Heavyweight unisex crewneck sweatshirt printed with archival botanical wildflower artwork. Includes sizing guide, washing care instructions, and gift-ready fulfillment.'
  );

  // Fee & Margin Calculator State (0% / 12% / 15% Offsite Ads + Break-Even)
  const [retailPrice, setRetailPrice] = useState(38.99);
  const [podBaseCost, setPodBaseCost] = useState(15.5);
  const [shippingCharged, setShippingCharged] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [offsiteAdsRate, setOffsiteAdsRate] = useState(0);

  // Printify & Gelato POD Builder State
  const [podProvider, setPodProvider] = useState('printify');
  const [podBlueprintKey, setPodBlueprintKey] = useState('comfort_colors_1717');
  const [podDesignUrl, setPodDesignUrl] = useState('https://assets.nullai.tech/sample_wildflower.png');

  // OAuth2 PKCE State
  const [clientId, setClientId] = useState('YOUR_ETSY_API_KEYSTRING');
  const [redirectUri, setRedirectUri] = useState('http://127.0.0.1:8108/oauth/callback');
  const [oauthState, setOauthState] = useState('zoth_state_8f3a2c91');
  const [authCodePlaceholder, setAuthCodePlaceholder] = useState('PASTE_REDIRECT_AUTH_CODE_HERE');
  const [selectedScopes, setSelectedScopes] = useState(['listings_r', 'listings_w', 'shops_r', 'transactions_r']);
  const [codeVerifier, setCodeVerifier] = useState(DEFAULT_VERIFIER);
  const [codeChallenge, setCodeChallenge] = useState(() => derivePkceChallenge(DEFAULT_VERIFIER));
  const [oauthSnippetTab, setOauthSnippetTab] = useState('authorize');

  // REST Endpoint & MCP Workbench State
  const [activeEndpointId, setActiveEndpointId] = useState(REST_ENDPOINTS[0].id);
  const [shopId, setShopId] = useState('me');
  const [searchKeywords, setSearchKeywords] = useState('wildflower sweatshirt');
  const [searchLimit, setSearchLimit] = useState(25);
  const [draftTaxonomyId, setDraftTaxonomyId] = useState(1099);
  const [draftTitle, setDraftTitle] = useState('Botanical Archival Printable Wall Art Pack | 300 DPI Multi-Ratio');
  const [draftPrice, setDraftPrice] = useState(11.99);

  const [activeMcpToolId, setActiveMcpToolId] = useState(MCP_TOOLS[0].id);
  const [mcpArgsText, setMcpArgsText] = useState(() => JSON.stringify(MCP_TOOLS[0].defaultArgs, null, 2));
  const [mcpOutputTab, setMcpOutputTab] = useState('jsonrpc');

  // Taxonomy Filter & Rate-Limit Quota Planner State
  const [taxonomyFilter, setTaxonomyFilter] = useState('');
  const [activeListingCount, setActiveListingCount] = useState(140);
  const [pollIntervalMin, setPollIntervalMin] = useState(30);
  const [callsPerListing, setCallsPerListing] = useState(2);
  const [parallelWorkers, setParallelWorkers] = useState(4);
  const [dailyDrafts, setDailyDrafts] = useState(25);

  const toggleScope = (scopeId) => {
    setSelectedScopes((prev) => {
      if (prev.includes(scopeId)) {
        return prev.length > 1 ? prev.filter((s) => s !== scopeId) : prev;
      }
      return [...prev, scopeId];
    });
  };

  const regeneratePkce = useCallback(() => {
    const nextVerifier = generateVerifierString(64);
    const nextState = generateStateNonce();
    setCodeVerifier(nextVerifier);
    setOauthState(nextState);
    setCodeChallenge(derivePkceChallenge(nextVerifier));
  }, []);

  const handleVerifierEdit = useCallback((val) => {
    const cleaned = val.replace(/[^A-Za-z0-9\-._~]/g, '').slice(0, 128);
    setCodeVerifier(cleaned);
    setCodeChallenge(derivePkceChallenge(cleaned));
  }, []);

  const selectMcpTool = (tool) => {
    setActiveMcpToolId(tool.id);
    setMcpArgsText(JSON.stringify(tool.defaultArgs, null, 2));
  };

  // Computed Engines
  const seoTagsList = useMemo(
    () => seoTagsText.split(',').map((t) => t.trim()).filter(Boolean),
    [seoTagsText]
  );

  const seoReport = useMemo(
    () => auditListing(seoTitle, seoTagsList, seoDesc),
    [seoTitle, seoTagsList, seoDesc]
  );

  const profitReport = useMemo(
    () =>
      calculateProfit({
        retailPrice,
        podBaseCost,
        shippingCharged,
        shippingCost,
        offsiteAdsRate,
      }),
    [retailPrice, podBaseCost, shippingCharged, shippingCost, offsiteAdsRate]
  );

  const activePodCatalog = podProvider === 'gelato' ? GELATO_PRODUCTS : PRINTIFY_BLUEPRINTS;
  const resolvedBlueprintKey = activePodCatalog[podBlueprintKey] ? podBlueprintKey : 'comfort_colors_1717';
  const podPayload = useMemo(
    () =>
      generatePodPayload({
        provider: podProvider,
        blueprintKey: resolvedBlueprintKey,
        title: seoTitle,
        description: seoDesc,
        tags: seoTagsList,
        designImageUrl: podDesignUrl,
        retailPriceUsd: activePodCatalog[resolvedBlueprintKey]?.recommended_retail_usd,
      }),
    [podProvider, resolvedBlueprintKey, seoTitle, seoDesc, seoTagsList, podDesignUrl, activePodCatalog]
  );

  const oauthBundle = useMemo(() => {
    const scopeStr = selectedScopes.join(' ');
    const params = new URLSearchParams({
      response_type: 'code',
      redirect_uri: redirectUri.trim() || 'http://127.0.0.1:8108/oauth/callback',
      scope: scopeStr,
      client_id: clientId.trim() || 'YOUR_ETSY_API_KEYSTRING',
      state: oauthState.trim() || 'zoth_state',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });
    const authorizeUrl = `https://www.etsy.com/oauth/connect?${params.toString()}`;
    const tokenCurl = `curl -X POST "https://api.etsy.com/v3/public/oauth/token" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=authorization_code" \\
  -d "client_id=${clientId.trim() || 'YOUR_ETSY_API_KEYSTRING'}" \\
  -d "redirect_uri=${encodeURIComponent(redirectUri.trim() || 'http://127.0.0.1:8108/oauth/callback')}" \\
  -d "code=${authCodePlaceholder.trim() || 'PASTE_REDIRECT_AUTH_CODE_HERE'}" \\
  -d "code_verifier=${codeVerifier}"`;
    const refreshCurl = `curl -X POST "https://api.etsy.com/v3/public/oauth/token" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=refresh_token" \\
  -d "client_id=${clientId.trim() || 'YOUR_ETSY_API_KEYSTRING'}" \\
  -d "refresh_token=\${ETSY_REFRESH_TOKEN}"`;
    return {
      scopeStr,
      authorizeUrl,
      tokenCurl,
      refreshCurl,
      verifierValid: codeVerifier.length >= 43 && codeVerifier.length <= 128,
    };
  }, [clientId, redirectUri, oauthState, selectedScopes, codeChallenge, codeVerifier, authCodePlaceholder]);

  const restBundle = useMemo(() => {
    const cleanShop = String(shopId || 'me').replace(/[^A-Za-z0-9_-]/g, '') || 'me';
    const ep = REST_ENDPOINTS.find((e) => e.id === activeEndpointId) || REST_ENDPOINTS[0];
    const resolvedPath = ep.path.replace('{shop_id}', cleanShop);
    let fullUrl = `https://openapi.etsy.com${resolvedPath}`;
    let bodyObj = null;

    if (ep.id === 'active-listings') {
      const qs = new URLSearchParams({
        keywords: searchKeywords.trim() || 'wildflower sweatshirt',
        limit: String(Math.min(100, Math.max(1, Number(searchLimit) || 25))),
        sort_on: 'score',
      });
      fullUrl = `${fullUrl}?${qs.toString()}`;
    } else if (ep.id === 'create-draft') {
      bodyObj = {
        quantity: 999,
        title: draftTitle.trim() || 'Untitled Digital Print',
        description: seoDesc,
        price: Math.max(0.2, Number(draftPrice) || 9.99),
        who_made: 'i_did',
        when_made: '2020_2026',
        taxonomy_id: Math.max(1, Number(draftTaxonomyId) || 1089),
        type: 'download',
        tags: seoTagsList.slice(0, 13),
        state: 'draft',
      };
    }

    const headers = [`-H "x-api-key: \${ETSY_API_KEY}"`];
    if (ep.requiresOAuth) {
      headers.push(`-H "Authorization: Bearer \${ETSY_ACCESS_TOKEN}"`);
      headers.push(`-H "Content-Type: application/json"`);
    }

    const curl =
      ep.method === 'POST'
        ? `curl -X POST "${fullUrl}" \\\n  ${headers.join(' \\\n  ')} \\\n  -d '${JSON.stringify(bodyObj).replace(/'/g, "'\\''")}'`
        : `curl -X GET "${fullUrl}" \\\n  ${headers.join(' \\\n  ')}`;

    return { ep, fullUrl, bodyObj, curl };
  }, [activeEndpointId, shopId, searchKeywords, searchLimit, draftTaxonomyId, draftTitle, draftPrice, seoDesc, seoTagsList]);

  const mcpBundle = useMemo(
    () => buildMcpBundle({ toolId: activeMcpToolId, argsText: mcpArgsText, clientId, shopId }),
    [activeMcpToolId, mcpArgsText, clientId, shopId]
  );

  const filteredTaxonomy = useMemo(() => {
    const q = taxonomyFilter.trim().toLowerCase();
    if (!q) return TAXONOMY_CATALOG;
    return TAXONOMY_CATALOG.filter(
      (row) =>
        row.group.toLowerCase().includes(q) ||
        row.category.toLowerCase().includes(q) ||
        String(row.taxonomyId).includes(q) ||
        row.keywords.some((k) => k.includes(q))
    );
  }, [taxonomyFilter]);

  const quotaAnalysis = useMemo(() => {
    const q = analyzeQuota({
      activeListingCount,
      pollIntervalMin,
      callsPerListing,
      parallelWorkers,
      dailyDrafts,
    });
    const budgetRows = [
      {
        id: 'sweep',
        operation: 'Paginated Shop Listings Sweep (100/page)',
        frequency: `${q.pollsPerDay} cycles / day`,
        callsDay: String(q.pollsPerDay * q.listSweepCallsPerPoll),
        sharePct: `${((q.pollsPerDay * q.listSweepCallsPerPoll / ETSY_QPD_LIMIT) * 100).toFixed(1)}%`,
        status: 'PASS',
      },
      {
        id: 'detail',
        operation: `Per-Listing Detail / Inventory Sync (${Math.max(0, callsPerListing - 1)} calls/item)`,
        frequency: `${activeListingCount} items × ${q.pollsPerDay} polls`,
        callsDay: String(q.pollsPerDay * q.detailCallsPerPoll),
        sharePct: `${((q.pollsPerDay * q.detailCallsPerPoll / ETSY_QPD_LIMIT) * 100).toFixed(1)}%`,
        status: q.pollsPerDay * q.detailCallsPerPoll > 7500 ? 'FAIL' : q.pollsPerDay * q.detailCallsPerPoll > 5000 ? 'WARN' : 'PASS',
      },
      {
        id: 'drafts',
        operation: 'New Draft + Mockup Image Uploads (5 calls/draft)',
        frequency: `${dailyDrafts} drafts / day`,
        callsDay: String(q.draftCallsPerDay),
        sharePct: `${((q.draftCallsPerDay / ETSY_QPD_LIMIT) * 100).toFixed(1)}%`,
        status: q.draftCallsPerDay > 2000 ? 'WARN' : 'PASS',
      },
      {
        id: 'total',
        operation: 'Total Projected Etsy Open API v3 Quota',
        frequency: `Limit: ${ETSY_QPD_LIMIT.toLocaleString()} QPD · ${ETSY_QPS_LIMIT} QPS`,
        callsDay: q.totalDailyCalls.toLocaleString(),
        sharePct: `${q.qpdUtilizationPct}%`,
        status: q.qpdSafe && q.qpsSafe ? 'PASS' : q.totalDailyCalls <= ETSY_QPD_LIMIT * 1.15 ? 'WARN' : 'FAIL',
      },
    ];
    return { ...q, budgetRows };
  }, [activeListingCount, pollIntervalMin, callsPerListing, parallelWorkers, dailyDrafts]);

  const kpis = [
    {
      label: 'SEO Audit Grade',
      value: `${seoReport.overall_score}/100`,
      unit: `Grade ${seoReport.grade} · ${seoReport.tags_audit.tag_count}/13 tags`,
      accent,
    },
    {
      label: 'Net Profit / Margin',
      value: `$${profitReport.net_profit.toFixed(2)}`,
      unit: `${profitReport.net_margin_pct}% · BE $${profitReport.break_even_price.toFixed(2)}`,
      accent: profitReport.profitable ? emeraldAccent : dangerAccent,
    },
    {
      label: 'MCP Bridge Tools',
      value: String(MCP_TOOLS.length),
      unit: 'python3 -m etsy_connector.cli mcp',
      accent: secondaryAccent,
    },
    {
      label: 'Daily Quota Use',
      value: `${quotaAnalysis.qpdUtilizationPct}%`,
      unit: `${quotaAnalysis.totalDailyCalls.toLocaleString()} / 10k QPD`,
      accent: goldAccent,
    },
  ];

  const statusNode = (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
      <SovereignStatusPill
        status={quotaAnalysis.qpdSafe && !mcpBundle.parseError ? 'online' : 'warn'}
        label={`OPEN API V3 · PKCE S256 · 8 MCP TOOLS · ${quotaAnalysis.totalDailyCalls.toLocaleString()}/10,000 QPD`}
        accent={accent}
        sx={{ maxWidth: '100%', '& .MuiTypography-root': { whiteSpace: 'normal', lineHeight: 1.25 } }}
      />
    </Box>
  );

  const actions = [
    {
      label: 'Download etsy-mcp-config.json',
      icon: <DownloadIcon fontSize="small" />,
      onClick: () => downloadJson(mcpBundle.mcpConfigObj, 'etsy-mcp-config.json'),
      primary: true,
    },
    {
      label: copied === 'oauth-url' ? 'Copied OAuth2 URL' : 'Copy OAuth2 Connect URL',
      icon: copied === 'oauth-url' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />,
      onClick: () => copy(oauthBundle.authorizeUrl, 'oauth-url'),
    },
    {
      label: copied === 'pod-json' ? 'Copied POD Payload' : 'Copy POD JSON',
      icon: copied === 'pod-json' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />,
      onClick: () => copy(JSON.stringify(podPayload, null, 2), 'pod-json'),
    },
    {
      label: 'etsy-connector on GitHub',
      icon: <GitHubIcon fontSize="small" />,
      href: 'https://github.com/1nc0gn30/etsy-connector',
    },
  ];

  const chipSx = (active, color = accent) => ({
    minHeight: 44,
    px: 0.75,
    fontFamily: MONO,
    fontSize: '0.73rem',
    fontWeight: active ? 700 : 600,
    bgcolor: active ? rgba(color, isDark ? 0.18 : 0.12) : 'transparent',
    color: active ? color : 'text.primary',
    border: `1px solid ${active ? color : isDark ? 'rgba(148,163,184,0.34)' : 'rgba(26,23,18,0.22)'}`,
  });

  const leftPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="01"
        eyebrow="ETSY OPEN API V3 · RFC 7636 PKCE"
        title="OAuth2 PKCE & Scope Builder"
        subtitle="Generate RFC 7636 S256 code_verifier + SHA-256 code_challenge, assemble Etsy authorization URLs, and copy token-exchange curl commands"
        accent={accent}
        right={<KeyIcon sx={{ color: accent }} />}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
            <TextField
              size="small"
              label="Client ID (API Keystring)"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              inputProps={{ 'aria-label': 'Client ID API Keystring' }}
              sx={{ flex: '1 1 180px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
            />
            <TextField
              size="small"
              label="CSRF State Nonce"
              value={oauthState}
              onChange={(e) => setOauthState(e.target.value)}
              inputProps={{ 'aria-label': 'CSRF State Nonce' }}
              sx={{ flex: '1 1 140px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
            />
          </Box>

          <TextField
            size="small"
            fullWidth
            label="OAuth2 Redirect URI"
            value={redirectUri}
            onChange={(e) => setRedirectUri(e.target.value)}
            inputProps={{ 'aria-label': 'OAuth2 Redirect URI' }}
            sx={{ '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
          />

          <Box>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
              SELECT ETSY V3 OAUTH2 SCOPES ({selectedScopes.length} ACTIVE)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {ETSY_OAUTH_SCOPES.map((sc) => {
                const active = selectedScopes.includes(sc.id);
                return (
                  <Chip
                    key={sc.id}
                    label={sc.label}
                    clickable
                    onClick={() => toggleScope(sc.id)}
                    sx={chipSx(active, accent)}
                  />
                );
              })}
            </Box>
          </Box>

          <Divider />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary' }}>
              RFC-7636 SHA-256 PKCE PAIR
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<RefreshIcon fontSize="small" />}
              onClick={regeneratePkce}
              sx={{
                minHeight: 44,
                fontFamily: MONO,
                fontSize: '0.73rem',
                fontWeight: 700,
                textTransform: 'none',
                color: accent,
                borderColor: accent,
              }}
            >
              Generate Fresh PKCE Pair
            </Button>
          </Box>

          <TextField
            size="small"
            fullWidth
            label={`PKCE code_verifier (${codeVerifier.length} chars · 43–128)`}
            value={codeVerifier}
            error={!oauthBundle.verifierValid}
            onChange={(e) => handleVerifierEdit(e.target.value)}
            inputProps={{ 'aria-label': 'PKCE code verifier' }}
            sx={{ '& input': { fontFamily: MONO, fontSize: '0.74rem' } }}
          />

          {/* Full-width non-wrapped SHA-256 code_challenge container */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: isDark ? 'rgba(253,186,116,0.08)' : '#FAF6EE',
              border: `1px solid ${rgba(accent, 0.35)}`,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.69rem', fontWeight: 700, color: accent }}>
                SHA-256 CODE_CHALLENGE (BASE64URL · S256)
              </Typography>
              <Chip size="small" label="S256" sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: accent, bgcolor: rgba(accent, 0.14) }} />
            </Box>
            <Typography
              sx={{
                fontFamily: MONO,
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'text.primary',
                wordBreak: 'break-all',
              }}
            >
              {codeChallenge}
            </Typography>
          </Box>

          <TextField
            size="small"
            fullWidth
            label="Returned Authorization Code (for Token Exchange curl)"
            value={authCodePlaceholder}
            onChange={(e) => setAuthCodePlaceholder(e.target.value)}
            inputProps={{ 'aria-label': 'Returned Authorization Code' }}
            sx={{ '& input': { fontFamily: MONO, fontSize: '0.75rem' } }}
          />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {[
              { id: 'authorize', label: 'Authorization URL' },
              { id: 'token', label: 'Token Exchange curl' },
              { id: 'refresh', label: 'Refresh Token curl' },
            ].map((t) => (
              <Chip
                key={t.id}
                label={t.label}
                clickable
                onClick={() => setOauthSnippetTab(t.id)}
                sx={chipSx(oauthSnippetTab === t.id, accent)}
              />
            ))}
          </Box>

          <SovereignCodeBlock
            title={
              oauthSnippetTab === 'authorize'
                ? 'etsy-oauth-connect.url'
                : oauthSnippetTab === 'token'
                ? 'etsy-oauth-token-exchange.sh'
                : 'etsy-oauth-refresh.sh'
            }
            badge={oauthSnippetTab.toUpperCase()}
            code={
              oauthSnippetTab === 'authorize'
                ? oauthBundle.authorizeUrl
                : oauthSnippetTab === 'token'
                ? oauthBundle.tokenCurl
                : oauthBundle.refreshCurl
            }
            filename={oauthSnippetTab === 'authorize' ? 'etsy-oauth-url.txt' : `etsy-oauth-${oauthSnippetTab}.sh`}
            accent={accent}
            maxHeight={200}
          />
        </Box>
      </SovereignCard>

      <SovereignCard
        index="02"
        eyebrow="ETSY V3 RATE-LIMIT BUDGET (10 QPS / 10,000 QPD)"
        title="QPS & QPD Quota Planner"
        subtitle="Model polling cadence, listing inventory sweeps, parallel workers, and daily draft uploads against Etsy's hard quota"
        accent={goldAccent}
        right={<SpeedIcon sx={{ color: goldAccent }} />}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 1.5 }}>
          <SovereignGauge
            value={quotaAnalysis.healthScore}
            label="Quota Headroom"
            unit="/100"
            size={112}
            accent={quotaAnalysis.qpdSafe ? emeraldAccent : dangerAccent}
          />
          <Box sx={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 700, color: 'text.primary' }}>
              {quotaAnalysis.totalDailyCalls.toLocaleString()} / {ETSY_QPD_LIMIT.toLocaleString()} req/day ({quotaAnalysis.qpdUtilizationPct}%)
            </Typography>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: 'text.secondary' }}>
              Headroom: {quotaAnalysis.remainingQpd.toLocaleString()} calls/day · Peak burst: {quotaAnalysis.unthrottledPeakQps} QPS
            </Typography>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: quotaAnalysis.qpsSafe ? emeraldAccent : dangerAccent }}>
              Recommended per-worker pacing: {quotaAnalysis.safeDelayMs} ms/request
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', color: 'text.secondary' }}>ACTIVE SHOP LISTINGS</Typography>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.75rem', fontWeight: 700, color: accent }}>{activeListingCount} listings</Typography>
            </Box>
            <Slider
              value={activeListingCount}
              min={10}
              max={1000}
              step={10}
              onChange={(_, v) => setActiveListingCount(Number(v))}
              aria-label="Active Shop Listings"
              sx={{ color: accent }}
            />
          </Box>

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', color: 'text.secondary' }}>POLL / SYNC INTERVAL</Typography>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.75rem', fontWeight: 700, color: accent }}>Every {pollIntervalMin} min ({quotaAnalysis.pollsPerDay}×/day)</Typography>
            </Box>
            <Slider
              value={pollIntervalMin}
              min={5}
              max={180}
              step={5}
              onChange={(_, v) => setPollIntervalMin(Number(v))}
              aria-label="Poll Interval Minutes"
              sx={{ color: accent }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
            <TextField
              size="small"
              type="number"
              label="Calls / Listing"
              value={callsPerListing}
              onChange={(e) => setCallsPerListing(Math.max(1, Math.min(8, Number(e.target.value))))}
              inputProps={{ min: 1, max: 8, 'aria-label': 'Calls per listing' }}
              sx={{ flex: '1 1 100px', '& input': { fontFamily: MONO } }}
            />
            <TextField
              size="small"
              type="number"
              label="Parallel Workers"
              value={parallelWorkers}
              onChange={(e) => setParallelWorkers(Math.max(1, Math.min(12, Number(e.target.value))))}
              inputProps={{ min: 1, max: 12, 'aria-label': 'Parallel workers' }}
              sx={{ flex: '1 1 110px', '& input': { fontFamily: MONO } }}
            />
            <TextField
              size="small"
              type="number"
              label="Daily Drafts"
              value={dailyDrafts}
              onChange={(e) => setDailyDrafts(Math.max(0, Math.min(500, Number(e.target.value))))}
              inputProps={{ min: 0, max: 500, 'aria-label': 'Daily drafts' }}
              sx={{ flex: '1 1 100px', '& input': { fontFamily: MONO } }}
            />
          </Box>
        </Box>
      </SovereignCard>
    </Box>
  );

  const rightPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="03"
        eyebrow="UNIFIED ETSY COMMERCE & MCP WORKBENCH"
        title="SEO Auditor, Fee Engine, Printify/Gelato POD & 8 MCP Tools"
        subtitle="Switch between live 13-tag SEO auditing, 0%/12%/15% Offsite Ads margin math, Printify & Gelato POD payloads, 8 stdio MCP tools, and REST v3 curl builders"
        accent={secondaryAccent}
        right={<StorefrontIcon sx={{ color: secondaryAccent }} />}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {[
            { id: 'seo', label: '13-Tag SEO Auditor' },
            { id: 'fees', label: '0%/12%/15% Fee Engine' },
            { id: 'pod', label: 'Printify & Gelato POD' },
            { id: 'mcp', label: '8 MCP Tools' },
            { id: 'rest', label: 'REST v3 Endpoints' },
          ].map((m) => {
            const active = workbenchMode === m.id;
            return (
              <Button
                key={m.id}
                size="small"
                variant={active ? 'contained' : 'outlined'}
                onClick={() => setWorkbenchMode(m.id)}
                sx={{
                  minHeight: 44,
                  fontFamily: MONO,
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  ...(active
                    ? { bgcolor: secondaryAccent, color: isDark ? '#0B0D12' : '#FFFFFF' }
                    : { color: 'text.primary', borderColor: isDark ? 'rgba(148,163,184,0.38)' : 'rgba(26,23,18,0.28)' }),
                }}
              >
                {m.label}
              </Button>
            );
          })}
        </Box>

        {/* MODE 1: 13-Tag SEO Auditor */}
        {workbenchMode === 'seo' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <TextField
              size="small"
              fullWidth
              label={`Listing Title (${seoReport.title_audit.char_length}/140 chars)`}
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              inputProps={{ 'aria-label': 'Etsy Listing Title' }}
              sx={{ '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
            />
            <TextField
              size="small"
              multiline
              minRows={3}
              fullWidth
              label={`13 Search Tags (${seoReport.tags_audit.tag_count}/13 tags · <= 20 chars each)`}
              value={seoTagsText}
              onChange={(e) => setSeoTagsText(e.target.value)}
              inputProps={{ 'aria-label': 'Etsy 13 Search Tags' }}
              sx={{ '& textarea': { fontFamily: MONO, fontSize: '0.76rem' } }}
            />
            <TextField
              size="small"
              multiline
              minRows={2}
              fullWidth
              label={`Listing Description (${seoReport.description_length} chars)`}
              value={seoDesc}
              onChange={(e) => setSeoDesc(e.target.value)}
              inputProps={{ 'aria-label': 'Etsy Listing Description' }}
              sx={{ '& textarea': { fontFamily: MONO, fontSize: '0.76rem' } }}
            />

            <SovereignKeyValueGrid
              cols={3}
              accent={accent}
              items={[
                { label: 'Overall SEO Score', value: `${seoReport.overall_score}/100 (Grade ${seoReport.grade})`, badge: seoReport.is_ready_to_publish ? 'READY' : 'FIX' },
                { label: 'Title Score', value: `${seoReport.title_audit.score}/100 · ${seoReport.title_audit.char_length}c`, badge: seoReport.title_audit.valid ? 'VALID' : 'LONG' },
                { label: 'Tags & Overlap', value: `${seoReport.tags_audit.tag_count}/13 · ${seoReport.shared_keywords_count} shared`, badge: seoReport.tags_audit.valid ? 'VALID' : 'CHECK' },
              ]}
            />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {seoReport.tags_audit.tags.map((tag, idx) => {
                const over = tag.length > 20;
                return (
                  <Chip
                    key={`${tag}-${idx}`}
                    label={`${tag} (${tag.length}/20)`}
                    sx={{
                      minHeight: 36,
                      fontFamily: MONO,
                      fontSize: '0.71rem',
                      fontWeight: 700,
                      bgcolor: over ? rgba(dangerAccent, 0.14) : rgba(emeraldAccent, 0.14),
                      color: over ? dangerAccent : emeraldAccent,
                      border: `1px solid ${over ? dangerAccent : emeraldAccent}`,
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        )}

        {/* MODE 2: Fee & Margin Calculator */}
        {workbenchMode === 'fees' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
              <TextField
                size="small"
                type="number"
                label="Retail Price ($)"
                value={retailPrice}
                onChange={(e) => setRetailPrice(Number(e.target.value))}
                inputProps={{ step: 0.01, min: 0, 'aria-label': 'Retail Price USD' }}
                sx={{ flex: '1 1 120px', '& input': { fontFamily: MONO } }}
              />
              <TextField
                size="small"
                type="number"
                label="POD Base Cost ($)"
                value={podBaseCost}
                onChange={(e) => setPodBaseCost(Number(e.target.value))}
                inputProps={{ step: 0.01, min: 0, 'aria-label': 'POD Base Cost USD' }}
                sx={{ flex: '1 1 120px', '& input': { fontFamily: MONO } }}
              />
              <TextField
                size="small"
                type="number"
                label="Buyer Shipping ($)"
                value={shippingCharged}
                onChange={(e) => setShippingCharged(Number(e.target.value))}
                inputProps={{ step: 0.01, min: 0, 'aria-label': 'Shipping Charged to Buyer USD' }}
                sx={{ flex: '1 1 120px', '& input': { fontFamily: MONO } }}
              />
              <TextField
                size="small"
                type="number"
                label="Outbound Ship ($)"
                value={shippingCost}
                onChange={(e) => setShippingCost(Number(e.target.value))}
                inputProps={{ step: 0.01, min: 0, 'aria-label': 'Outbound Shipping Cost USD' }}
                sx={{ flex: '1 1 120px', '& input': { fontFamily: MONO } }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {[
                { rate: 0, label: '0% Organic' },
                { rate: 0.12, label: '12% Offsite Ads (>=$10k/yr)' },
                { rate: 0.15, label: '15% Offsite Ads (<$10k/yr)' },
              ].map((t) => (
                <Chip
                  key={t.rate}
                  label={t.label}
                  clickable
                  onClick={() => setOffsiteAdsRate(t.rate)}
                  sx={chipSx(offsiteAdsRate === t.rate, accent)}
                />
              ))}
            </Box>

            <SovereignKeyValueGrid
              cols={3}
              accent={accent}
              items={[
                { label: 'Net Profit', value: `$${profitReport.net_profit.toFixed(2)}`, badge: profitReport.profitable ? 'PROFIT' : 'LOSS' },
                { label: 'Net Margin / ROI', value: `${profitReport.net_margin_pct}% / ${profitReport.roi_pct}%`, badge: profitReport.offsite_ads_tier },
                { label: 'Break-Even Retail', value: `$${profitReport.break_even_price.toFixed(2)}`, badge: 'MIN PRICE' },
                { label: 'Gross Revenue', value: `$${profitReport.gross_revenue.toFixed(2)}`, badge: 'BUYER PAYS' },
                { label: 'Total Etsy Fees', value: `$${profitReport.etsy_fees.total_etsy_fees.toFixed(2)}`, badge: `Tx $${profitReport.etsy_fees.transaction_fee.toFixed(2)}` },
                { label: 'Offsite Ads Fee', value: `$${profitReport.etsy_fees.offsite_ads_fee.toFixed(2)}`, badge: `${Math.round(profitReport.offsite_ads_rate * 100)}%` },
              ]}
            />
          </Box>
        )}

        {/* MODE 3: Printify & Gelato POD Builder */}
        {workbenchMode === 'pod' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {[
                { id: 'printify', label: 'Printify REST API v1 (Providers 29/26/3/0)' },
                { id: 'gelato', label: 'Gelato Ecommerce API v4 (Regional productUid)' },
              ].map((p) => (
                <Chip
                  key={p.id}
                  label={p.label}
                  clickable
                  onClick={() => setPodProvider(p.id)}
                  sx={chipSx(podProvider === p.id, accent)}
                />
              ))}
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
              <TextField
                select
                size="small"
                label="Product Blueprint / SKU"
                value={resolvedBlueprintKey}
                onChange={(e) => setPodBlueprintKey(e.target.value)}
                inputProps={{ 'aria-label': 'POD Product Blueprint' }}
                sx={{ flex: '1 1 240px', '& .MuiSelect-select': { fontFamily: MONO, fontSize: '0.76rem' } }}
              >
                {Object.entries(activePodCatalog).map(([key, item]) => (
                  <MenuItem key={key} value={key}>
                    {item.name} (${item.base_cost_usd.toFixed(2)} COGS)
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                size="small"
                label="300 DPI Design Artwork URL"
                value={podDesignUrl}
                onChange={(e) => setPodDesignUrl(e.target.value)}
                inputProps={{ 'aria-label': '300 DPI Design Artwork URL' }}
                sx={{ flex: '1 1 220px', '& input': { fontFamily: MONO, fontSize: '0.76rem' } }}
              />
            </Box>

            <SovereignCodeBlock
              title={`etsy-${podProvider}-${resolvedBlueprintKey}.json`}
              badge={podProvider.toUpperCase()}
              code={JSON.stringify(podPayload, null, 2)}
              filename={`etsy-${podProvider}-${resolvedBlueprintKey}.json`}
              accent={accent}
              maxHeight={260}
            />
          </Box>
        )}

        {/* MODE 4: 8 MCP Tools */}
        {workbenchMode === 'mcp' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <SovereignPresetBar
              presets={MCP_TOOLS}
              activeId={activeMcpToolId}
              onSelect={selectMcpTool}
              onReset={() => selectMcpTool(MCP_TOOLS[0])}
              accent={secondaryAccent}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary' }}>
                LIVE EDITABLE TOOL ARGUMENTS (JSON)
              </Typography>
              <Chip
                size="small"
                label={mcpBundle.parseError ? `JSON ERROR: ${mcpBundle.parseError}` : 'VALID JSON-RPC 2.0 ARGUMENTS'}
                sx={{
                  fontFamily: MONO,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  bgcolor: mcpBundle.parseError ? rgba(dangerAccent, 0.14) : rgba(emeraldAccent, 0.14),
                  color: mcpBundle.parseError ? dangerAccent : emeraldAccent,
                }}
              />
            </Box>

            <TextField
              size="small"
              multiline
              minRows={5}
              maxRows={11}
              fullWidth
              label="MCP Tool Arguments JSON"
              value={mcpArgsText}
              error={Boolean(mcpBundle.parseError)}
              onChange={(e) => setMcpArgsText(e.target.value)}
              inputProps={{ 'aria-label': 'MCP JSON Arguments' }}
              sx={{ '& textarea': { fontFamily: MONO, fontSize: '0.76rem', lineHeight: 1.5 } }}
            />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {[
                  { id: 'jsonrpc', label: 'JSON-RPC tools/call' },
                  { id: 'config', label: 'etsy-mcp-config.json' },
                  { id: 'stdio', label: 'Local stdio Pipe' },
                ].map((t) => (
                  <Chip
                    key={t.id}
                    label={t.label}
                    clickable
                    onClick={() => setMcpOutputTab(t.id)}
                    sx={chipSx(mcpOutputTab === t.id, secondaryAccent)}
                  />
                ))}
              </Box>
              <Button
                size="small"
                variant="outlined"
                startIcon={<DownloadIcon fontSize="small" />}
                onClick={() => downloadJson(mcpBundle.mcpConfigObj, 'etsy-mcp-config.json')}
                sx={{
                  minHeight: 44,
                  fontFamily: MONO,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  color: secondaryAccent,
                  borderColor: secondaryAccent,
                }}
              >
                Download etsy-mcp-config.json
              </Button>
            </Box>

            <SovereignCodeBlock
              title={
                mcpOutputTab === 'jsonrpc'
                  ? `${activeMcpToolId}-rpc.json`
                  : mcpOutputTab === 'config'
                  ? 'etsy-mcp-config.json'
                  : 'etsy-mcp-stdio.sh'
              }
              badge={mcpOutputTab.toUpperCase()}
              code={
                mcpOutputTab === 'jsonrpc'
                  ? mcpBundle.jsonRpcText
                  : mcpOutputTab === 'config'
                  ? mcpBundle.mcpConfigText
                  : mcpBundle.stdioPipeCmd
              }
              filename={
                mcpOutputTab === 'jsonrpc'
                  ? `${activeMcpToolId}-rpc.json`
                  : mcpOutputTab === 'config'
                  ? 'etsy-mcp-config.json'
                  : 'etsy-mcp-stdio.sh'
              }
              accent={secondaryAccent}
              maxHeight={240}
            />
          </Box>
        )}

        {/* MODE 5: REST Endpoints */}
        {workbenchMode === 'rest' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {REST_ENDPOINTS.map((ep) => (
                <Chip
                  key={ep.id}
                  label={`${ep.label} · ${ep.badge}`}
                  clickable
                  onClick={() => setActiveEndpointId(ep.id)}
                  sx={chipSx(activeEndpointId === ep.id, secondaryAccent)}
                />
              ))}
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
              <TextField
                size="small"
                label="Shop ID"
                value={shopId}
                onChange={(e) => setShopId(e.target.value)}
                inputProps={{ 'aria-label': 'Etsy Shop ID' }}
                sx={{ flex: '1 1 140px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
              />
              {activeEndpointId === 'active-listings' && (
                <>
                  <TextField
                    size="small"
                    label="Search Keywords"
                    value={searchKeywords}
                    onChange={(e) => setSearchKeywords(e.target.value)}
                    inputProps={{ 'aria-label': 'Etsy Search Keywords' }}
                    sx={{ flex: '2 1 200px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
                  />
                  <TextField
                    size="small"
                    type="number"
                    label="Limit (1–100)"
                    value={searchLimit}
                    onChange={(e) => setSearchLimit(Math.max(1, Math.min(100, Number(e.target.value))))}
                    inputProps={{ min: 1, max: 100, 'aria-label': 'Search Result Limit' }}
                    sx={{ flex: '0 1 110px', '& input': { fontFamily: MONO } }}
                  />
                </>
              )}
              {activeEndpointId === 'create-draft' && (
                <>
                  <TextField
                    size="small"
                    type="number"
                    label="Taxonomy ID"
                    value={draftTaxonomyId}
                    onChange={(e) => setDraftTaxonomyId(Math.max(1, Number(e.target.value)))}
                    inputProps={{ 'aria-label': 'Draft Taxonomy ID' }}
                    sx={{ flex: '0 1 125px', '& input': { fontFamily: MONO } }}
                  />
                  <TextField
                    size="small"
                    type="number"
                    label="Price ($)"
                    value={draftPrice}
                    onChange={(e) => setDraftPrice(Math.max(0.2, Number(e.target.value)))}
                    inputProps={{ 'aria-label': 'Draft Price USD' }}
                    sx={{ flex: '0 1 110px', '& input': { fontFamily: MONO } }}
                  />
                  <TextField
                    size="small"
                    fullWidth
                    label="Draft Title (<= 140 chars)"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    inputProps={{ 'aria-label': 'Draft Listing Title' }}
                    sx={{ '& input': { fontFamily: MONO, fontSize: '0.76rem' } }}
                  />
                </>
              )}
            </Box>

            <SovereignKeyValueGrid
              cols={2}
              accent={secondaryAccent}
              items={[
                { label: 'Resolved Endpoint', value: restBundle.fullUrl, badge: restBundle.ep.method },
                {
                  label: 'Auth Header Requirement',
                  value: restBundle.ep.requiresOAuth ? 'x-api-key + Bearer OAuth2' : 'x-api-key (Public v3)',
                  badge: restBundle.ep.requiresOAuth ? 'OAUTH2' : 'KEYSTRING',
                },
              ]}
            />

            <SovereignCodeBlock
              title={`etsy-v3-${restBundle.ep.id}.sh`}
              badge="CURL"
              code={restBundle.curl}
              filename={`etsy-v3-${restBundle.ep.id}.sh`}
              accent={secondaryAccent}
              maxHeight={220}
            />
          </Box>
        )}
      </SovereignCard>

      <SovereignCard
        index="04"
        eyebrow="CANONICAL SELLER TAXONOMY LOOKUP (TAXONOMY.PY PARITY)"
        title="Etsy v3 Seller Taxonomy Reference (8 Nodes)"
        subtitle="Filter canonical POD & digital seller taxonomy IDs matching src/etsy_connector/taxonomy.py; click a chip to apply its taxonomy_id"
        accent={accent}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5, alignItems: 'center' }}>
          <TextField
            size="small"
            label="Filter Taxonomy"
            placeholder="Filter (Apparel, Mugs, 1099, 1089)..."
            value={taxonomyFilter}
            onChange={(e) => setTaxonomyFilter(e.target.value)}
            inputProps={{ 'aria-label': 'Filter Etsy Seller Taxonomy' }}
            sx={{ flex: '1 1 220px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
          />
          {['All', 'Apparel', 'Mugs', 'Totes', 'Digital Prints', 'Patterns'].map((grp) => {
            const active = (grp === 'All' && !taxonomyFilter) || taxonomyFilter.toLowerCase() === grp.toLowerCase();
            return (
              <Chip
                key={grp}
                label={grp}
                clickable
                onClick={() => setTaxonomyFilter(grp === 'All' ? '' : grp)}
                sx={chipSx(active, accent)}
              />
            );
          })}
        </Box>

        <SovereignDataTable
          eyebrow="VERIFIED ETSY SELLER TAXONOMY NODES"
          title={`Canonical Taxonomy Table (${filteredTaxonomy.length} nodes · Active Draft ID: ${draftTaxonomyId})`}
          filename="etsy-seller-taxonomy-ids.csv"
          accent={accent}
          maxHeight={250}
          columns={[
            { key: 'taxonomyId', label: 'ID', mono: true },
            { key: 'group', label: 'Group' },
            { key: 'category', label: 'Taxonomy Path' },
            { key: 'fulfillment', label: 'Fulfillment' },
            { key: 'typicalMargin', label: 'Margin', mono: true, align: 'right' },
          ]}
          rows={filteredTaxonomy}
        />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
          {filteredTaxonomy.map((t) => {
            const applied = Number(draftTaxonomyId) === t.taxonomyId;
            return (
              <Chip
                key={t.id}
                label={`Apply #${t.taxonomyId} (${t.group})`}
                clickable
                onClick={() => {
                  setDraftTaxonomyId(t.taxonomyId);
                  if (activeMcpToolId === 'etsy_create_draft_listing' && mcpBundle.parsedArgs) {
                    setMcpArgsText(JSON.stringify({ ...mcpBundle.parsedArgs, taxonomy_id: t.taxonomyId }, null, 2));
                  }
                }}
                sx={chipSx(applied, emeraldAccent)}
              />
            );
          })}
        </Box>
      </SovereignCard>
    </Box>
  );

  const bottomPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignDataTable
        eyebrow="ETSY V3 RATE-LIMIT BREAKDOWN"
        title={`Daily Request Budget (${quotaAnalysis.totalDailyCalls.toLocaleString()} / 10,000 QPD · ${quotaAnalysis.unthrottledPeakQps} Peak QPS)`}
        filename="etsy-v3-quota-budget.csv"
        accent={goldAccent}
        maxHeight={260}
        columns={[
          { key: 'operation', label: 'API Workload' },
          { key: 'frequency', label: 'Cadence', mono: true },
          { key: 'callsDay', label: 'Req / Day', mono: true, align: 'right' },
          { key: 'sharePct', label: '% of 10k QPD', mono: true, align: 'right' },
          { key: 'status', label: 'Quota' },
        ]}
        rows={quotaAnalysis.budgetRows}
      />

      <SovereignCard
        index="05"
        eyebrow="LOCAL CLI, BRAILLE TUI & MCP DAEMON (:8108)"
        title="Etsy Connector Local Execution"
        subtitle="Keep Etsy OAuth2 access tokens and API keystrings strictly on loopback when executing live draft writes or MCP stdio calls"
        accent={accent}
        right={<CodeIcon sx={{ color: accent }} />}
      >
        <SovereignCodeBlock
          title="ETSY-CONNECTOR LOCAL CLI (:8108)"
          badge="LOCAL LOOPBACK"
          code={`# Check local Etsy connector status & 8-tool MCP bridge\netsy-connector --status\n\n# Audit title & 13 tags / model 12% Offsite Ads / build Gelato POD JSON\netsy-connector audit --title "Wildflower Crewneck Sweatshirt..." --tags "wildflower crewneck,botanical gift" --json\netsy-connector profit --retail 38.99 --pod 15.50 --offsite-ads-rate 0.12 --json\netsy-connector pod --provider gelato --blueprint fine_art_poster_18x24 --title "Botanical Poster"\n\n# Launch loopback workstation on http://127.0.0.1:8108 or Braille TUI\npython3 /opt/etsy-connector/server.py --host 127.0.0.1 --port 8108\netsy-connector-tui --once`}
          filename="etsy-connector.sh"
          accent={accent}
        />
      </SovereignCard>
    </Box>
  );

  return (
    <Box sx={{ width: '100%', minWidth: 0 }} data-testid="etsy-connector-godmode-workstation">
      <Box sx={{ mb: 2 }}>
        <SovereignAlertBanner
          severity="info"
          title="Runtime Scope · Client-Side SEO, Fee, Printify/Gelato POD & PKCE S256 + Local Loopback Bridge (:8108)"
          message="13-tag SEO auditing, 0%/12%/15% Offsite Ads & break-even calculations, Printify & Gelato POD payload builders, RFC 7636 PKCE SHA-256, REST curl synthesis, 8 MCP tool envelopes, taxonomy lookups, and QPS/QPD rate-limit planning execute 100% client-side with zero outbound network calls. Run live OAuth token exchanges and shop writes locally via etsy-connector (:8108)."
        />
      </Box>
      <SovereignWorkstationShell
        id="etsy-connector"
        category="COMMERCE & MCP · ETSY OPEN API V3 (:8108)"
        title="Etsy Connector & MCP Bridge"
        subtitle="13-tag SEO auditor, 0%/12%/15% Offsite Ads & break-even calculator, Printify & Gelato POD payload builders, RFC 7636 OAuth2 PKCE S256, 8 stdio MCP tools, and 10 QPS / 10,000 QPD quota planner."
        version={ETSY_CONNECTOR_VERSION}
        variant="hex-lattice"
        accent={accent}
        metrics={kpis}
        status={statusNode}
        actions={actions}
        leftPane={leftPane}
        rightPane={rightPane}
        bottomPane={bottomPane}
        leftCols={5}
        rightCols={7}
      />
    </Box>
  );
}
