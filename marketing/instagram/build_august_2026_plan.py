#!/usr/bin/env python3
"""Build The Maids of Virginia — August 2026 Instagram Content Plan PDF."""
import calendar as cal
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (BaseDocTemplate, Frame, PageTemplate, Paragraph,
                                Spacer, Table, TableStyle, KeepTogether, PageBreak)

OUT = "The_Maids_of_Virginia_Instagram_Plan_August_2026_v3.pdf"

# ---------------------------------------------------------------- brand colors
SAPPHIRE = HexColor("#165EB0")
YELLOW   = HexColor("#FFD800")
ORANGE   = HexColor("#FF5301")
INK      = HexColor("#1B2733")
GRAY     = HexColor("#5B6770")
BA_T     = HexColor("#E8F0FA")   # Monday tint
TIP_T    = HexColor("#FFF8D1")   # Wednesday tint
FRI_T    = HexColor("#FFE9DE")   # Friday tint
STORY_T  = HexColor("#F1F3F5")   # story-only tint
REST_T   = HexColor("#FBFBFB")
LINE     = HexColor("#D7DDE3")
SLATE    = HexColor("#44525C")   # story-only header

# ---------------------------------------------------------------- text styles
def st(name, **kw):
    base = dict(fontName="Helvetica", fontSize=8.8, leading=11.8, textColor=INK,
                alignment=TA_LEFT, spaceAfter=0, spaceBefore=0)
    base.update(kw)
    return ParagraphStyle(name, **base)

S_TITLE   = st("title", fontName="Helvetica-Bold", fontSize=19, leading=22, textColor=white)
S_SUB     = st("sub", fontSize=9.5, leading=13, textColor=HexColor("#DCE9F8"))
S_H2      = st("h2", fontName="Helvetica-Bold", fontSize=12.5, leading=15, textColor=SAPPHIRE,
               spaceBefore=6, spaceAfter=3)
S_BODY    = st("body")
S_SMALL   = st("small", fontSize=8, leading=10.6, textColor=GRAY)
S_CAL_HD  = st("calhd", fontName="Helvetica-Bold", fontSize=8.2, leading=10, textColor=white,
               alignment=TA_CENTER)
S_CAL_D   = st("cald", fontName="Helvetica-Bold", fontSize=8.6, leading=9.6)
S_CAL_L   = st("call", fontSize=6.6, leading=7.9)
S_CAL_R   = st("calr", fontSize=6.8, leading=8, textColor=HexColor("#9AA4AD"),
               alignment=TA_CENTER, fontName="Helvetica-Oblique")
S_BLK_HW  = st("blkhw", fontName="Helvetica-Bold", fontSize=9.6, leading=12, textColor=white)
S_BLK_HD  = st("blkhd", fontName="Helvetica-Bold", fontSize=9.6, leading=12, textColor=INK)
S_LBL     = st("lbl", fontName="Helvetica-Bold", fontSize=7.2, leading=9.6, textColor=GRAY)
S_VAL     = st("val", fontSize=8.7, leading=11.4)
S_HOOK    = st("hook", fontName="Helvetica-BoldOblique", fontSize=9.4, leading=12, textColor=SAPPHIRE)
S_TAGS    = st("tags", fontName="Courier", fontSize=8.4, leading=11.6)
S_CHIP    = st("chip", fontName="Helvetica-Bold", fontSize=7.6, leading=9.4,
               alignment=TA_CENTER, textColor=INK)

W = 7.5 * inch  # usable width

# ---------------------------------------------------------------- footer
def on_page(canvas, doc):
    canvas.saveState()
    w, h = LETTER
    canvas.setFillColor(SAPPHIRE); canvas.rect(0, 0, w * 0.60, 5, fill=1, stroke=0)
    canvas.setFillColor(YELLOW);   canvas.rect(w * 0.60, 0, w * 0.25, 5, fill=1, stroke=0)
    canvas.setFillColor(ORANGE);   canvas.rect(w * 0.85, 0, w * 0.15, 5, fill=1, stroke=0)
    canvas.setFont("Helvetica", 7); canvas.setFillColor(GRAY)
    canvas.drawString(0.5 * inch, 0.30 * inch,
                      "The Maids of Virginia  |  @themaidsofvirginia  |  August 2026 Instagram Content Plan  |  weekdays only")
    canvas.drawRightString(w - 0.5 * inch, 0.30 * inch, "Page %d" % canvas.getPageNumber())
    canvas.restoreState()

doc = BaseDocTemplate(OUT, pagesize=LETTER,
                      leftMargin=0.5 * inch, rightMargin=0.5 * inch,
                      topMargin=0.5 * inch, bottomMargin=0.62 * inch,
                      title="The Maids of Virginia — August 2026 Instagram Content Plan",
                      author="The Maids of Virginia")
frame = Frame(doc.leftMargin, doc.bottomMargin, W, doc.height, id="main",
              leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
doc.addPageTemplates([PageTemplate(id="all", frames=[frame], onPage=on_page)])

story = []

# ---------------------------------------------------------------- title block
title_inner = [
    [Paragraph("THE MAIDS OF VIRGINIA", S_TITLE)],
    [Paragraph("August 2026 Instagram Content Plan  |  @themaidsofvirginia  |  Referred for a reason.", S_SUB)],
]
tt = Table(title_inner, colWidths=[W])
tt.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), SAPPHIRE),
    ("LEFTPADDING", (0, 0), (-1, -1), 14), ("RIGHTPADDING", (0, 0), (-1, -1), 14),
    ("TOPPADDING", (0, 0), (0, 0), 12), ("BOTTOMPADDING", (0, 1), (0, 1), 11),
    ("TOPPADDING", (0, 1), (0, 1), 2), ("BOTTOMPADDING", (0, 0), (0, 0), 1),
]))
stripe = Table([["", "", ""]], colWidths=[W * 0.6, W * 0.25, W * 0.15], rowHeights=[4])
stripe.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (0, 0), YELLOW),
    ("BACKGROUND", (1, 0), (1, 0), ORANGE),
    ("BACKGROUND", (2, 0), (2, 0), YELLOW),
]))
story += [tt, stripe, Spacer(0, 7)]

chips = [
    ("GOAL: FOLLOWER GROWTH + ENGAGEMENT — NOT SALES", BA_T),
    ("13 FEED POSTS", TIP_T),
    ("21 STORY DAYS", FRI_T),
    ("WEEKDAYS ONLY", STORY_T),
]
chip_t = Table([[Paragraph(c, S_CHIP) for c, _ in chips]],
               colWidths=[W * 0.40, W * 0.18, W * 0.18, W * 0.24])
chip_t.setStyle(TableStyle(
    [("BACKGROUND", (i, 0), (i, 0), col) for i, (_, col) in enumerate(chips)] +
    [("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
     ("LEFTPADDING", (0, 0), (-1, -1), 4), ("RIGHTPADDING", (0, 0), (-1, -1), 4),
     ("GRID", (0, 0), (-1, -1), 2, white)]))
story += [chip_t, Spacer(0, 9)]

# ---------------------------------------------------------------- calendar data
CAL = {
    3:  ("ba",   ["POST: B/A Reel", "The Grout Comeback", "Story: poll > B/A"]),
    4:  ("so",   ["Story only", "Review graphic", "Yes/No > Reviews"]),
    5:  ("tip",  ["POST: Maid Simple #1", "Stainless steel", "Story: Yes/No > Service"]),
    6:  ("so",   ["Story only", "Question box: ask a pro", "> Service"]),
    7:  ("fri",  ["POST: Suds and Science #1", "Bleach + vinegar (VO 1)", "Story: Yes/No > Service"]),
    10: ("ba",   ["POST: B/A Reel", "Kitchen, 22-Step captions", "Story: poll > B/A"]),
    11: ("so",   ["Story only", "Review graphic", "Poll > Reviews"]),
    12: ("tip",  ["POST: Maid Simple #2", "Clean in sections", "Story: question > Service"]),
    13: ("so",   ["Story only", "Q+A answer round", "> Service"]),
    14: ("fri",  ["POST: Testimonial Reel", "Jeff E., 5 stars", "Story: poll > Reviews"]),
    17: ("ba",   ["POST: B/A Reel", "HEPA upholstery rescue", "Story: Yes/No > B/A"]),
    18: ("so",   ["Story only", "Review graphic", "Yes/No > Reviews"]),
    19: ("tip",  ["POST: Maid Simple #3", "Microfiber vs. cotton", "Story: poll > Service"]),
    20: ("so",   ["Story only", "Team BTS + guess poll", "> Our Team"]),
    21: ("fri",  ["POST: Suds and Science #2", "Vinegar vs. natural stone", "Story: Yes/No > Service"]),
    24: ("ba",   ["POST: B/A Reel", "Hard water vs. glass", "Story: poll > B/A"]),
    25: ("so",   ["Story only", "Review graphic", "Slider > Reviews"]),
    26: ("tip",  ["POST: Maid Simple #4", "Dwell time (VO 2)", "Story: question > Service"]),
    27: ("so",   ["Story only", "Spotlight teaser poll", "> Our Team"]),
    28: ("fri",  ["POST: Team Spotlight", "Day-in-the-life montage", "Story: slider > Our Team"]),
    31: ("ba",   ["POST: B/A Reel", "The September Reset", "Story: poll > B/A"]),
}
TINT = {"ba": BA_T, "tip": TIP_T, "fri": FRI_T, "so": STORY_T}

story.append(Paragraph("August 2026 Calendar", S_H2))

cal.setfirstweekday(cal.MONDAY)
weeks = cal.monthcalendar(2026, 8)
head = [Paragraph(d, S_CAL_HD) for d in ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]]
rows, styles_c = [head], []
styles_c += [
    ("BACKGROUND", (0, 0), (4, 0), SAPPHIRE),
    ("BACKGROUND", (5, 0), (6, 0), HexColor("#8FA6BC")),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("GRID", (0, 0), (-1, -1), 0.6, LINE),
    ("LEFTPADDING", (0, 0), (-1, -1), 3.5), ("RIGHTPADDING", (0, 0), (-1, -1), 2.5),
    ("TOPPADDING", (0, 0), (-1, -1), 3), ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5),
]
for wi, wk in enumerate(weeks, start=1):
    row = []
    for di, day in enumerate(wk):
        if day == 0:
            row.append("")
            styles_c.append(("BACKGROUND", (di, wi), (di, wi), REST_T))
            continue
        if di >= 5:  # weekend
            row.append([Paragraph(str(day), st("wd", fontName="Helvetica-Bold", fontSize=8.6,
                                               leading=9.6, textColor=HexColor("#9AA4AD"))),
                        Paragraph("rest", S_CAL_R)])
            styles_c.append(("BACKGROUND", (di, wi), (di, wi), REST_T))
            continue
        kind, lines = CAL[day]
        cell = [Paragraph(str(day), S_CAL_D)]
        cell += [Paragraph(ln, S_CAL_L) for ln in lines]
        row.append(cell)
        styles_c.append(("BACKGROUND", (di, wi), (di, wi), TINT[kind]))
    rows.append(row)

wd = (W - 2 * 0.58 * inch) / 5.0
cal_t = Table(rows, colWidths=[wd] * 5 + [0.58 * inch] * 2)
cal_t.setStyle(TableStyle(styles_c))
story.append(cal_t)
story.append(Spacer(0, 5))

legend = [
    ("Monday — Before/After Reel", BA_T),
    ("Wednesday — Maid Simple Reel", TIP_T),
    ("Friday — rotating slot", FRI_T),
    ("Tue/Thu — Story only", STORY_T),
]
leg_t = Table([[Paragraph(t, st("lg", fontSize=7.4, leading=9.4, alignment=TA_CENTER)) for t, _ in legend]],
              colWidths=[W / 4.0] * 4)
leg_t.setStyle(TableStyle(
    [("BACKGROUND", (i, 0), (i, 0), c) for i, (_, c) in enumerate(legend)] +
    [("TOPPADDING", (0, 0), (-1, -1), 3.5), ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5),
     ("GRID", (0, 0), (-1, -1), 2, white)]))
story.append(leg_t)
story.append(Spacer(0, 4))
story.append(Paragraph(
    "VO = one of the month's two voiceover Reels (Aug 7 and Aug 26). Every other Reel is trending audio or ASMR "
    "cleaning sound with text overlay. Saturdays and Sundays are fully off: no posts, no Stories.", S_SMALL))
story.append(Spacer(0, 10))

# ---------------------------------------------------------------- hashtag block
story.append(Paragraph("Standard Hashtag Block — defined once, used everywhere", S_H2))
story.append(Paragraph(
    "Paste as the <b>first comment</b> on every feed post (never in the caption), within one minute of publishing:",
    S_BODY))
story.append(Spacer(0, 4))
TAGS = ("#TheMaidsOfVirginia #ReferredForAReason #maidservice #cleaningservice #housecleaning "
        "#residentialcleaning #deepcleaning #professionalcleaners #cleaningtips #cleaninghacks #cleantok "
        "#satisfyingcleaning #asmrcleaning #beforeandafter #cleaningmotivation #alexandriava #arlingtonva "
        "#washingtondc #princewilliamcounty #manassas #northernva")
tag_t = Table([[Paragraph(TAGS, S_TAGS)]], colWidths=[W])
tag_t.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), TIP_T),
    ("BOX", (0, 0), (-1, -1), 1, YELLOW),
    ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 10),
    ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
]))
story.append(tag_t)
story.append(Spacer(0, 2))
story.append(Paragraph(
    "21 tags: brand + the stated service area (Alexandria, Arlington, D.C., Prince William) + reach-focused cleaning "
    "tags. In the post blocks below, “First comment” always means this exact block.", S_SMALL))

story.append(PageBreak())

# ---------------------------------------------------------------- rules page
def rule_box(title, lines, accent):
    body = [[Paragraph(title, st("rt", fontName="Helvetica-Bold", fontSize=9.8, leading=12.4,
                                 textColor=INK))]]
    for ln in lines:
        body.append([Paragraph(ln, st("rl", fontSize=8.6, leading=11.6, spaceAfter=2))])
    t = Table(body, colWidths=[W])
    t.setStyle(TableStyle([
        ("LINEBEFORE", (0, 0), (0, -1), 3, accent),
        ("BACKGROUND", (0, 0), (-1, -1), HexColor("#FAFBFC")),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (0, 0), 6), ("BOTTOMPADDING", (0, -1), (-1, -1), 7),
        ("TOPPADDING", (0, 1), (-1, -1), 1), ("BOTTOMPADDING", (0, 0), (-1, -2), 1),
    ]))
    return t

B = "• "

# ---------------------------------------------------------------- story rhythm
story.append(Paragraph("Weekly Story Rhythm (repeats all month, Monday–Friday)", S_H2))
rh_head = ["Day", "Story", "Interactive sticker", "Save to highlight"]
rhythm = [
    ("Mon", "Share the Before/After Reel", "Poll or Yes/No", "Before/After"),
    ("Tue", "Review graphic (brand template: sapphire background, golden stars, white quote)", "Yes/No, poll, or slider", "Reviews"),
    ("Wed", "Share the Maid Simple Reel", "Yes/No, poll, or question box", "Service"),
    ("Thu", "Engagement day: question box, answer round, or team behind-the-scenes", "Question box or poll", "Service / Our Team"),
    ("Fri", "Share the Friday post", "Poll, slider, or Yes/No", "Matches the slot: Reviews, Service, or Our Team"),
    ("Sat–Sun", "Off. No posts, no Stories.", "—", "—"),
]
rh_rows = [[Paragraph("<b>%s</b>" % h, st("rh", fontSize=8, leading=10.4, textColor=white)) for h in rh_head]]
for r in rhythm:
    rh_rows.append([Paragraph(x, st("rr", fontSize=8.2, leading=10.6)) for x in r])
rh_t = Table(rh_rows, colWidths=[0.65 * inch, 3.55 * inch, 1.6 * inch, 1.7 * inch])
rh_t.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), SAPPHIRE),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, HexColor("#F4F7FB")]),
    ("GRID", (0, 0), (-1, -1), 0.6, LINE),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 5),
    ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
]))
story.append(rh_t)
story.append(Spacer(0, 12))

# ---------------------------------------------------------------- post blocks
details_head = [
    Paragraph("Post-by-Post Details", S_H2),
    Paragraph(
        "Every post and story day of the month, in order. Captions are paste-ready. “First comment” always "
        "means the standard hashtag block defined on page 1.", S_BODY),
    Spacer(0, 8),
]

HEAD_BG  = {"ba": SAPPHIRE, "tip": YELLOW, "fri": ORANGE, "so": SLATE}
HEAD_ST  = {"ba": S_BLK_HW, "tip": S_BLK_HD, "fri": S_BLK_HW, "so": S_BLK_HW}
TINT_BG  = {"ba": BA_T, "tip": TIP_T, "fri": FRI_T, "so": STORY_T}

def block(kind, header, fields):
    lab_w = 1.02 * inch
    rows = [[Paragraph(header, HEAD_ST[kind]), ""]]
    for lab, val, sty in fields:
        rows.append([Paragraph(lab.upper(), S_LBL), Paragraph(val, sty)])
    t = Table(rows, colWidths=[lab_w, W - lab_w])
    ts = [
        ("SPAN", (0, 0), (1, 0)),
        ("BACKGROUND", (0, 0), (1, 0), HEAD_BG[kind]),
        ("LINEBEFORE", (0, 0), (0, -1), 3.5, HEAD_BG[kind]),
        ("BACKGROUND", (0, 1), (-1, -1), HexColor("#FCFCFD")),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
        ("LINEBELOW", (0, 1), (-1, -2), 0.4, HexColor("#EAEEF2")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, 0), 5.5), ("BOTTOMPADDING", (0, 0), (-1, 0), 5.5),
        ("TOPPADDING", (0, 1), (-1, -1), 4), ("BOTTOMPADDING", (0, 1), (-1, -1), 4),
    ]
    t.setStyle(TableStyle(ts))
    return KeepTogether([t, Spacer(0, 9)])

def story_block(header, text):
    rows = [[Paragraph(header, S_BLK_HW)], [Paragraph(text, S_VAL)]]
    t = Table(rows, colWidths=[W])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), SLATE),
        ("LINEBEFORE", (0, 0), (0, -1), 3.5, SLATE),
        ("BACKGROUND", (0, 1), (0, 1), STORY_T),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (0, 0), 4.5), ("BOTTOMPADDING", (0, 0), (0, 0), 4.5),
        ("TOPPADDING", (0, 1), (0, 1), 4.5), ("BOTTOMPADDING", (0, 1), (0, 1), 5.5),
    ]))
    return KeepTogether([t, Spacer(0, 9)])

F, A, H, C, CAP, FC, SA, N = ("Format", "Audio", "On-screen hook", "Concept / shot plan",
                              "Caption (paste-ready)", "First comment", "Story action", "Notes")
TAG_LINE = "Standard hashtag block (page 1), posted within one minute of publishing."

# ---- MON AUG 3
story += details_head
story.append(block("ba", "MON AUG 3  |  BEFORE/AFTER REEL — THE GROUT COMEBACK", [
    (F, "Reel, under 15 seconds. Dirty shot first, hold the after shot a full 2 seconds, branded cover applied "
        "before posting.", S_VAL),
    (A, "ASMR brush-and-foam sound or trending audio, text overlay only. No dialogue.", S_VAL),
    (H, "“Watch three years of soap scum lose in 12 seconds.”", S_HOOK),
    (C, "Bathroom tile, grout, and tub. 0–2 sec: tight shot of dulled grout lines and a filmed tub edge. "
        "2–10 sec: fast ASMR montage — grout brush, foam, rinse. Final beat: wide shot of bright tile, held 2 "
        "full seconds. Real footage, no filter on the after.", S_VAL),
    (CAP, "Soap scum and mineral film build up in every busy bathroom — that is not neglect, that is chemistry doing "
          "what chemistry does. Our team met it with the 22-Step Healthy Touch Deep Cleaning System and won. Watch "
          "the last frame: real grout, no filter. Which reveal should we film next — tile, tub, or glass? Tell us "
          "below. Alexandria, Arlington, D.C. and Prince William. Follow for a transformation every Monday.", S_VAL),
    (FC, TAG_LINE, S_VAL),
    (SA, "Share the Reel with a poll sticker: “Be honest — did you think that grout was beige?” "
         "Yes / 100%. Save to the <b>Before/After</b> highlight.", S_VAL),
]))

# ---- TUE AUG 4
story.append(story_block("TUE AUG 4  |  STORY ONLY — REVIEW GRAPHIC #1",
    "Brand-template review graphic (sapphire background, golden five stars, white quote text) featuring a recent "
    "5-star review. Sticker: Yes/No — “Have you ever hired a professional cleaning team?” Save to the "
    "<b>Reviews</b> highlight."))

# ---- WED AUG 5
story.append(block("tip", "WED AUG 5  |  MAID SIMPLE #1 — STAINLESS STEEL", [
    (F, "Reel, about 10 seconds, branded cover before posting.", S_VAL),
    (A, "ASMR spray-and-wipe audio with text overlay. No dialogue.", S_VAL),
    (H, "“Maid Simple: streak-free stainless in 10 seconds”", S_HOOK),
    (C, "Close-up demo on a fridge or dishwasher front: microfiber cloth glides, paper towel comparison flashes "
        "briefly, finish on the streak-free panel.", S_VAL),
    (CAP, "Maid Simple, tip #1: microfiber, not paper towels, on stainless steel. Zero streaks, zero lint. Save this "
          "for Sunday reset. Follow for a new pro tip every Wednesday.", S_VAL),
    (FC, TAG_LINE, S_VAL),
    (SA, "Share the Reel with a Yes/No sticker: “Did you know this?” Save to the <b>Service</b> highlight.", S_VAL),
]))

# ---- THU AUG 6
story.append(story_block("THU AUG 6  |  STORY ONLY — QUESTION BOX",
    "One clean branded frame: “Ask a professional house cleaner anything.” Question box sticker. Prompt "
    "ideas on the frame: stubborn surfaces, product choices, room order. Answers feed next Thursday's story. Save to "
    "the <b>Service</b> highlight."))

# ---- FRI AUG 7
story.append(block("fri", "FRI AUG 7  |  SUDS AND SCIENCE #1 — BLEACH + VINEGAR  (VOICEOVER REEL 1 OF 2)", [
    (F, "Reel, 15–20 seconds. Series visual: two bottles side by side, big red X between them, bold text "
        "overlay. Branded cover before posting.", S_VAL),
    (A, "<b>Voiceover Reel 1 of 2</b> (calm, professional narration recorded off-camera) over soft music. Script: "
        "“Two bottles you probably own. Bleach and vinegar each clean beautifully — mixed together, they "
        "release chlorine gas. Different days, different buckets, always. Suds and Science, from The Maids of "
        "Virginia.”", S_VAL),
    (H, "“These two are under your sink right now. Never combine them.”", S_HOOK),
    (C, "Text-forward safety explainer. Bottles labeled BLEACH and VINEGAR slide in, red X lands between them, "
        "key line appears: “bleach + vinegar = chlorine gas.” This is a save-and-share magnet.", S_VAL),
    (CAP, "Suds and Science, part 1. Bleach plus vinegar releases chlorine gas, which can irritate your eyes, "
          "throat, and lungs even in small amounts. Use them on different days, in different buckets, always. Our "
          "teams are trained on safe product handling in every home. Save this one and share it with anyone who "
          "mixes their own cleaners. Follow for more Suds and Science.", S_VAL),
    (FC, TAG_LINE, S_VAL),
    (SA, "Share the Reel with a Yes/No sticker: “Did you know this combination was dangerous?” Save to the "
         "<b>Service</b> highlight.", S_VAL),
    (N, "Chemistry stays accurate and specific — chlorine gas is an irritant even at low levels; do not "
        "exaggerate beyond the caption language.", S_VAL),
]))

# ---- MON AUG 10
story.append(block("ba", "MON AUG 10  |  BEFORE/AFTER REEL — KITCHEN, 22-STEP BRANDING", [
    (F, "Reel, under 15 seconds. Dirty shot first, hold the after shot a full 2 seconds, branded cover before "
        "posting.", S_VAL),
    (A, "Trending audio or ASMR kitchen sounds, text overlay only. No dialogue.", S_VAL),
    (H, "“We clean every kitchen in 22 steps. Watch.”", S_HOOK),
    (C, "Time-lapse of a full kitchen clean compressed under 15 seconds: greasy stovetop first, then counters, "
        "sink, appliance fronts, with numbered 22-Step captions rotating on screen as the payoff to the hook. The "
        "numbered system is the differentiator no competitor can copy. Final wide shot held 2 seconds.", S_VAL),
    (CAP, "Grease never quits — neither does the checklist. This kitchen got the full 22-Step Healthy Touch Deep "
          "Cleaning System: every step, every visit, in the same order every time. Save this if you love a system. "
          "Alexandria, Arlington, D.C. and Prince William. Follow along — Mondays are for transformations.", S_VAL),
    (FC, TAG_LINE, S_VAL),
    (SA, "Share the Reel with a poll sticker: “Toughest kitchen opponent?” Stovetop / Microwave / Sink. "
         "Save to the <b>Before/After</b> highlight.", S_VAL),
]))

# ---- TUE AUG 11
story.append(story_block("TUE AUG 11  |  STORY ONLY — REVIEW GRAPHIC #2",
    "Brand-template review graphic, different review than Aug 4. Sticker: poll — “What matters most in a "
    "cleaning team?” Consistency / Attention to detail. Save to the <b>Reviews</b> highlight."))

# ---- WED AUG 12
story.append(block("tip", "WED AUG 12  |  MAID SIMPLE #2 — CLEAN IN SECTIONS", [
    (F, "Reel, 10–15 seconds, branded cover before posting.", S_VAL),
    (A, "Trending audio or ASMR cleaning sound, text overlay only. No dialogue.", S_VAL),
    (H, "“Maid Simple: pros don't clean rooms. They clean sections.”", S_HOOK),
    (C, "Overhead or wide shot of one room with a graphic overlay dividing it into quadrants. Each section lights "
        "up and gets a checkmark as it is finished completely — top to bottom, left to right — before the next one "
        "starts. Close with the full room checked off.", S_VAL),
    (CAP, "Maid Simple, tip #2: divide every room into sections and finish one completely before touching the next. "
          "Work each section top to bottom, left to right, and you never double back, never miss a corner, and "
          "never re-clean a spot you already finished. It is the single biggest reason a pro team moves faster than "
          "a whole afternoon of circling the house. Save this for your next weekend clean. Follow for a new pro tip "
          "every Wednesday.", S_VAL),
    (FC, TAG_LINE, S_VAL),
    (SA, "Share the Reel with a question sticker: “What spot does every cleaning lap somehow miss?” Screenshot "
         "the best answers for Thursday's answer round. Save to the <b>Service</b> highlight.", S_VAL),
]))

# ---- THU AUG 13
story.append(story_block("THU AUG 13  |  STORY ONLY — ANSWER ROUND",
    "Two or three branded frames answering the best questions from the Aug 6 question box and the Aug 12 question "
    "sticker (credit askers by first name only). Last frame: Yes/No — “Want more Q+A Thursdays?” Save to "
    "the <b>Service</b> highlight."))

# ---- FRI AUG 14
story.append(block("fri", "FRI AUG 14  |  TESTIMONIAL REEL — JEFF E.", [
    (F, "Reel, 10–15 seconds, branded cover before posting. Saved to the Reviews highlight via the story "
        "share.", S_VAL),
    (A, "Soft trending audio, no dialogue. Five golden stars animate in over real footage of the team working.", S_VAL),
    (H, "“Like always, they exceed every expectation.” — the review itself is the hook, on screen from second "
        "one.", S_HOOK),
    (C, "Open on the quote in white on sapphire with five golden stars animating in beneath it, over footage of the "
        "team that cleaned that home: arrival, detail shots, the finished rooms. The rest of the quote and the "
        "reviewer's name land line by line.", S_VAL),
    (CAP, "“Like always, they exceed every expectation.” Thank you, Jeff E. Referred for a reason — and "
          "this is the reason. Follow to meet the teams behind the reviews.", S_VAL),
    (FC, TAG_LINE, S_VAL),
    (SA, "Share the Reel with a poll sticker: “Best part of a freshly cleaned home?” Walking in the door / "
         "The smell / Not lifting a finger / The first shower. Save to the <b>Reviews</b> highlight.", S_VAL),
]))

# ---- MON AUG 17
story.append(block("ba", "MON AUG 17  |  BEFORE/AFTER REEL — UPHOLSTERY, HEPA DEEP CLEAN", [
    (F, "Reel, under 15 seconds. Dirty shot first, hold the after shot a full 2 seconds, branded cover before "
        "posting.", S_VAL),
    (A, "ASMR extraction sound (very satisfying) or trending audio, text overlay only. No dialogue.", S_VAL),
    (H, "“Some vacuums blow fine dust back into the room. Ours trap it.”", S_HOOK),
    (C, "How HEPA filtration works, told through a transformation. Dull, dusty cushion close-up first, then a slow "
        "HEPA-vacuum pass revives the fabric color stripe by stripe; quick macro cutaway of the sealed filter "
        "canister; wide after shot of the brightened couch held 2 full seconds.", S_VAL),
    (CAP, "Sofas and carpets hold more fine dust than any hard surface in the house — and a vacuum without sealed "
          "HEPA filtration can send the finest particles right back into the air. Our teams run HEPA filtration on "
          "every visit: it traps 99.97% of particles at 0.3 microns, the hardest size to catch. So what leaves the "
          "couch leaves the room. Share this with the allergy sufferer in your life. Alexandria, Arlington, D.C. "
          "and Prince William. Follow for Monday transformations.", S_VAL),
    (FC, TAG_LINE, S_VAL),
    (SA, "Share the Reel with a Yes/No sticker: “Did you know a vacuum could put dust back into the air?” "
         "Save to the <b>Before/After</b> highlight.", S_VAL),
]))

# ---- TUE AUG 18
story.append(story_block("TUE AUG 18  |  STORY ONLY — REVIEW GRAPHIC #3",
    "Brand-template review graphic, new review. Sticker: Yes/No — “Do you read reviews before trying a local "
    "business?” Save to the <b>Reviews</b> highlight."))

# ---- WED AUG 19
story.append(block("tip", "WED AUG 19  |  MAID SIMPLE #3 — WHY MICROFIBER LIFTS INSTEAD OF SMEARS", [
    (F, "Reel, 10–15 seconds, branded cover before posting.", S_VAL),
    (A, "ASMR wipe sound or trending audio, text overlay only. No dialogue.", S_VAL),
    (H, "“Maid Simple: one of these cloths just pushes dirt around.”", S_HOOK),
    (C, "Side-by-side demo on the same greasy counter or mirror: a cotton rag smears an arc, a microfiber cloth "
        "strips a clean stripe in one pass. Macro cutaway of microfiber's split fibers grabbing and holding the "
        "soil. Label each side on screen: COTTON / MICROFIBER.", S_VAL),
    (CAP, "Maid Simple, tip #3: cotton rags and paper towels mostly push oil and dust around. Microfiber is "
          "different physics — every strand is split into dozens of microscopic edges, and those edges plus "
          "capillary action grab soil and hold it until the cloth hits the wash. Same wipe, completely different "
          "result. Save this before your next dusting day. Follow for a new pro tip every Wednesday.", S_VAL),
    (FC, TAG_LINE, S_VAL),
    (SA, "Share the Reel with a poll sticker: “What is your daily driver?” Microfiber / Cotton rags / Paper "
         "towels. Save to the <b>Service</b> highlight.", S_VAL),
]))

# ---- THU AUG 20
story.append(story_block("THU AUG 20  |  STORY ONLY — TEAM BEHIND-THE-SCENES",
    "Photo of a four-person team's morning load-out: labeled caddies, color-coded microfiber, HEPA vacuum. Sticker: "
    "poll — “Guess: how many microfiber cloths does one team go through in a day?” 10 / 25 / 50+. Reveal "
    "the real number in a second frame. Save to the <b>Our Team</b> highlight."))

# ---- FRI AUG 21
story.append(block("fri", "FRI AUG 21  |  SUDS AND SCIENCE #2 — VINEGAR AND NATURAL STONE", [
    (F, "Reel or text-forward post, 15–20 seconds. Same visual system as part 1 (bottle, red X) so the series "
        "is instantly recognizable in the grid. Branded cover before posting.", S_VAL),
    (A, "Trending audio or soft music with text overlay. No dialogue, no voiceover — the month's two voiceover slots "
        "are Aug 7 and Aug 26.", S_VAL),
    (H, "“Vinegar cleans a lot of things. It eats marble.”", S_HOOK),
    (C, "Part 2 of the series: bottle labeled VINEGAR slides toward a marble countertop, red X lands between them, "
        "key line appears: “acid + calcium carbonate = etching.” Close-up insert of a dull etch ring that "
        "looks like a water mark but never wipes away.", S_VAL),
    (CAP, "Suds and Science, part 2. Vinegar is an acid, and marble, limestone, and travertine are calcium "
          "carbonate — the same mineral as chalk. Acid dissolves it on contact, leaving dull etch marks that look "
          "like water rings but are actually damage to the stone itself. No product fixes an etch; only refinishing "
          "does. It is why our teams carry pH-neutral, stone-safe cleaners for every natural surface. Save this if "
          "you have stone counters, and share it with someone who cleans everything with vinegar. Follow for more "
          "Suds and Science.", S_VAL),
    (FC, TAG_LINE, S_VAL),
    (SA, "Share the Reel with a Yes/No sticker: “Did you know vinegar can permanently mark natural stone?” "
         "Save to the <b>Service</b> highlight.", S_VAL),
]))

# ---- MON AUG 24
story.append(block("ba", "MON AUG 24  |  BEFORE/AFTER REEL — HARD WATER VS. SHOWER GLASS", [
    (F, "Reel, under 15 seconds. Dirty shot first, hold the after shot a full 2 seconds, branded cover before "
        "posting.", S_VAL),
    (A, "ASMR scrub-and-squeegee sound or trending audio, text overlay only. No dialogue.", S_VAL),
    (H, "“The film on your shower glass isn't soap. It's rock.”", S_HOOK),
    (C, "The science of hard water, told through a transformation. Clouded shower glass and a crusted faucet first, "
        "descale-and-scrub montage, one long squeegee pull as the reveal, then crystal-clear glass and gleaming "
        "chrome held 2 full seconds.", S_VAL),
    (CAP, "That cloudy film on shower glass is dissolved rock: calcium and magnesium that stay behind every time a "
          "water droplet dries. Add soap and it becomes scum; add time and it hardens like stone. Our team "
          "dissolves it with the right chemistry, not brute force, then squeegees it to clear. Hold the last frame "
          "— that is bare glass. Alexandria, Arlington, D.C. and Prince William. Follow for Monday "
          "transformations.", S_VAL),
    (FC, TAG_LINE, S_VAL),
    (SA, "Share the Reel with a poll sticker: “Where does hard water hit hardest at your place?” Shower "
         "glass / Faucets / Kettle / Everywhere. Save to the <b>Before/After</b> highlight.", S_VAL),
]))

# ---- TUE AUG 25
story.append(story_block("TUE AUG 25  |  STORY ONLY — REVIEW GRAPHIC #4",
    "Brand-template review graphic, new review. Sticker: slider — “How much does a freshly cleaned home lower "
    "your stress?” Save to the <b>Reviews</b> highlight."))

# ---- WED AUG 26
story.append(block("tip", "WED AUG 26  |  MAID SIMPLE #4 — DWELL TIME  (VOICEOVER REEL 2 OF 2)", [
    (F, "Reel, 12–15 seconds with an on-screen countdown timer, branded cover before posting.", S_VAL),
    (A, "<b>Voiceover Reel 2 of 2</b> (calm, professional narration recorded off-camera) over soft music. Script: "
        "“Here is a pro secret: stop scrubbing. Spray, walk away, and give it five minutes — that is dwell "
        "time, and it is printed right on the label. Let the chemistry do the scrubbing for you. Maid Simple, from "
        "The Maids of Virginia.”", S_VAL),
    (H, "“Stop scrubbing your shower. Pros spray it and walk away.”", S_HOOK),
    (C, "Spray a shower wall, then the team literally walks out of frame; timer overlay ticks forward in "
        "fast-motion while the product visibly works, then one effortless wipe reveals the clean stripe. Side text: "
        "“the label tells you the minutes.”", S_VAL),
    (CAP, "Maid Simple, tip #4: spray, then walk away. Every cleaner has a dwell time — the minutes it needs to sit "
          "wet and break soil down before you wipe. It is printed right on the label, and disinfectants do not "
          "disinfect without it. Spray the shower, go pour the coffee, come back to an easier job. Less scrubbing, "
          "better results. Save this one. Follow for a new pro tip every Wednesday.", S_VAL),
    (FC, TAG_LINE, S_VAL),
    (SA, "Share the Reel with a question sticker: “What should Maid Simple cover next?” Answers seed the "
         "September lineup. Save to the <b>Service</b> highlight.", S_VAL),
]))

# ---- THU AUG 27
story.append(story_block("THU AUG 27  |  STORY ONLY — SPOTLIGHT TEASER",
    "Candid photo of tomorrow's featured team member mid-task (no face required if they prefer). Sticker: poll — "
    "“Tomorrow you meet one of our pros. Guess their years on the team.” 2 / 5 / 8+. Save to the "
    "<b>Our Team</b> highlight."))

# ---- FRI AUG 28
story.append(block("fri", "FRI AUG 28  |  TEAM SPOTLIGHT", [
    (F, "Reel, 15–20 second day-in-the-life montage, branded cover before posting.", S_VAL),
    (A, "Upbeat trending audio with text overlay. No dialogue — names, years, and fun facts appear as text.", S_VAL),
    (H, "“Meet the team behind the sparkle” + name and years of service.", S_HOOK),
    (C, "Day-in-the-life montage: van load-out, the four-person team arriving, gloves on, favorite detail shots, a "
        "finished room. Overlay three text facts: name and role, years with the company, a personal favorite "
        "step of the 22. Swap in any August birthday or work anniversary as the featured moment.", S_VAL),
    (CAP, "[Name] has been making Northern Virginia homes shine for [X] years. When we say referred for a reason, "
          "this is the reason. Say hi to [Name] in the comments. Follow to meet more of the team.", S_VAL),
    (FC, TAG_LINE, S_VAL),
    (SA, "Share the Reel with a slider sticker: “Show [Name] some love.” Save to the <b>Our Team</b> "
         "highlight.", S_VAL),
]))

# ---- MON AUG 31
story.append(block("ba", "MON AUG 31  |  BEFORE/AFTER REEL — THE SEPTEMBER RESET", [
    (F, "Reel, under 15 seconds. Dirty shot first in every room pair, hold the final after shot a full 2 seconds, "
        "branded cover before posting.", S_VAL),
    (A, "Trending back-to-school-adjacent audio or ASMR montage sound, text overlay only. No dialogue.", S_VAL),
    (H, "“School is back. Your house can reset too.”", S_HOOK),
    (C, "Whole-home montage, about 3 seconds per pair: entryway, kitchen, bathroom — each dirty-first, then its "
        "after. Final wide shot held 2 full seconds. Summer is the opponent here: sunscreen film, sand, snack "
        "crumbs.", S_VAL),
    (CAP, "Labor Day week is reset week. Summer leaves its mark on every home — sunscreen, sand, snack crumbs, all "
          "of it — and one deep clean clears the board for September. Save this as your reset checklist: entryway, "
          "kitchen, bath. Alexandria, Arlington, D.C. and Prince William. Follow for transformations every Monday.", S_VAL),
    (FC, TAG_LINE, S_VAL),
    (SA, "Share the Reel with a poll sticker: “September reset — which room goes first?” Kitchen / "
         "Bathrooms / Entryway / All of it. Save to the <b>Before/After</b> highlight.", S_VAL),
]))

# ---------------------------------------------------------------- topic bank
story.append(Paragraph("Suds and Science — Topic Bank for September and Beyond", S_H2))
story.append(Paragraph(
    "The series is intentionally broader than product-mixing safety: any cleaning education fits. Accurate, "
    "specific, never exaggerated. Ready-to-film topics:", S_BODY))
story.append(Spacer(0, 5))
story.append(rule_box("Next up in the series", [
    B + "<b>Why bleach and glass cleaner never share a bucket.</b> Many glass cleaners contain ammonia, and "
        "ammonia plus bleach creates chloramine fumes that cause dizziness, shortness of breath, and nausea — the "
        "natural part 3 after August's bleach + vinegar post.",
    B + "<b>The baking soda + vinegar myth.</b> Mixed together they mostly neutralize each other — the fizz is "
        "carbon dioxide leaving, and what remains is basically salt water. Great volcano, weak cleaner.",
    B + "<b>Why dish soap cuts grease.</b> Surfactant molecules have a water-loving head and an oil-loving tail; "
        "they surround grease droplets and float them away instead of spreading them.",
    B + "<b>Why hot water cleans faster.</b> Heat speeds the chemistry: soils dissolve sooner, surfactants work "
        "harder, and grease softens once it warms past its melt point.",
], SAPPHIRE))
story.append(Spacer(0, 6))
story.append(Paragraph(
    "September planning inputs already built into August: the Aug 26 question sticker (“What should Maid Simple "
    "cover next?”), the Aug 6 / Aug 13 Q+A round, and the poll results from every Friday story.", S_SMALL))

doc.build(story)

import pypdfium2 as pdfium
print("pages:", len(pdfium.PdfDocument(OUT)))
print("wrote", OUT)
