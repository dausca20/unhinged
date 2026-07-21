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

OUT = "The_Maids_of_Virginia_Instagram_Plan_August_2026_v2.pdf"

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
    5:  ("tip",  ["POST: Maid Simple #1", "Stainless steel (kept)", "Story: Yes/No > Service"]),
    6:  ("so",   ["Story only", "Question box: ask a pro", "> Service"]),
    7:  ("fri",  ["POST: Suds and Science #1", "Bleach + vinegar (VO 1)", "Story: Yes/No > Service"]),
    10: ("ba",   ["POST: B/A Reel", "Kitchen, 22-Step captions", "Story: poll > B/A"]),
    11: ("so",   ["Story only", "Review graphic", "Poll > Reviews"]),
    12: ("tip",  ["POST: Maid Simple #2", "Dust top to bottom", "Story: question > Service"]),
    13: ("so",   ["Story only", "Q+A answer round", "> Service"]),
    14: ("fri",  ["POST: Testimonial Reel", "Jeff E., 5 stars", "Story: poll > Reviews"]),
    17: ("ba",   ["POST: B/A Reel", "Upholstery rescue", "Story: slider > B/A"]),
    18: ("so",   ["Story only", "Review graphic", "Yes/No > Reviews"]),
    19: ("tip",  ["POST: Maid Simple #3", "Two-towel rule", "Story: Yes/No > Service"]),
    20: ("so",   ["Story only", "Team BTS + guess poll", "> Our Team"]),
    21: ("fri",  ["POST: Suds and Science #2", "Bleach + glass cleaner", "Story: poll > Service"]),
    24: ("ba",   ["POST: B/A Reel", "The Oven Finale", "Story: poll > B/A"]),
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
story.append(Paragraph("Operating Rules for the Month", S_H2))
story.append(rule_box("Posting structure (weekdays only)", [
    B + "<b>Monday</b> — Before/After transformation Reel. Under 15 seconds, dirty shot first, hold the after shot a "
        "full 2 seconds, branded cover applied before posting.",
    B + "<b>Wednesday</b> — Maid Simple tip Reel. Pro-level tips only: things a professional cleaner knows that most "
        "homeowners do not.",
    B + "<b>Friday</b> — rotating slot: Suds and Science (Aug 7) &gt; Testimonial, saved to the Reviews highlight "
        "(Aug 14) &gt; Suds and Science (Aug 21) &gt; Team Spotlight (Aug 28).",
    B + "No Saturday or Sunday posts or Stories of any kind. Suggested publish window: 11:30 am–1:00 pm ET.",
    B + "Every Reel gets a branded cover before posting (Sapphire Blue bar, series name in Golden Yellow) so the grid "
        "reads as three clean, recognizable series.",
], SAPPHIRE))
story.append(Spacer(0, 6))
story.append(rule_box("Audio and voice rules", [
    B + "No one speaks on camera, ever, in any language. No talking-head content, no spoken tips.",
    B + "Default sound: a trending audio chosen the week of posting, or ASMR cleaning sound, always with text overlay.",
    B + "<b>Exactly two Reels this month use a recorded voiceover:</b> Aug 7 (Suds and Science #1) and Aug 26 "
        "(Maid Simple #4). Short scripts are included in those post blocks. No other Reel uses voiceover.",
    B + "Written voice: professional, authoritative, reassuring, efficient.",
    B + "The mess is never the client's fault — it is the opponent the team beats. No shame language toward "
        "clients, ever.",
    B + "Keep every chemical claim accurate and specific. Never exaggerate.",
], ORANGE))
story.append(Spacer(0, 6))
story.append(rule_box("Engagement-first defaults (account is under 100 followers)", [
    B + "Share every post to Stories the day it publishes with an interactive sticker: poll, slider, Yes/No, or "
        "question box. Engagement stickers are the priority at this size.",
    B + "Save every Story to one of four highlights: <b>Reviews, Our Team, Before/After, Service</b>. By September 1 "
        "all four highlights are fully populated from this rhythm alone.",
    B + "Every caption ends with a follow, save, share, or comment prompt. No booking CTAs this month — the goal is "
        "reach and community, not sales.",
    B + "Reply to every comment and question-sticker answer within 24 hours; at this follower count, each reply "
        "roughly doubles that person's odds of following.",
], YELLOW))
story.append(Spacer(0, 10))

# ---------------------------------------------------------------- story rhythm
story.append(Paragraph("Weekly Story Rhythm (repeats all month, Monday–Friday)", S_H2))
rh_head = ["Day", "Story", "Interactive sticker", "Save to highlight"]
rhythm = [
    ("Mon", "Share the Before/After Reel", "Poll", "Before/After"),
    ("Tue", "Review graphic (brand template: sapphire background, golden stars, white quote)", "Yes/No, poll, or slider", "Reviews"),
    ("Wed", "Share the Maid Simple Reel", "Yes/No or question box", "Service"),
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
story.append(Spacer(0, 10))

# ---------------------------------------------------------------- what changed
story.append(Paragraph("What Changed From the Prior Version", S_H2))
changed = [
    "Educational series name locked as <b>Suds and Science</b> (was “Don't Mix That!”). Aug 7 and Aug 21 keep "
    "their accurate chemistry topics under the new name.",
    "Aug 3 concept fully replaced — the “Yohanna vs. hardwater” footage was not used. New bathroom "
    "transformation (“The Grout Comeback”) with a new hook.",
    "Aug 26 “vacuum before you mop” tip replaced entirely with a pro-level dwell-time tip. Aug 5 stainless "
    "steel tip kept as-is.",
    "All weekend activity removed — posts and Stories run Monday–Friday only — and the Saturday "
    "neighborhood/service-area Story is gone. Highlights consolidate to Reviews, Our Team, Before/After, Service.",
    "Spanish spoken-tip option removed under the new audio rules — no one speaks on camera in any language. All Reels "
    "are music or ASMR plus text overlay except the two marked voiceover Reels (Aug 7, Aug 26).",
    "Every Story now carries an interactive sticker; Thursdays become dedicated engagement days (Q+A, answer rounds, "
    "team behind-the-scenes).",
    "Hashtag block rebuilt around the stated service area plus reach-focused cleaning tags.",
]
story.append(rule_box("Seven changes, at a glance", [B + c for c in changed], ORANGE))
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
    (H, "“The grout was white the whole time.”", S_HOOK),
    (C, "Bathroom tile, grout, and tub. 0–2 sec: tight shot of dulled grout lines and a filmed tub edge. "
        "2–13 sec: fast ASMR montage — grout brush, foam, rinse. Final beat: wide shot of bright tile, held 2 "
        "full seconds. Real footage, no filter on the after.", S_VAL),
    (CAP, "Soap scum and mineral film build up in every busy bathroom — that is not neglect, that is chemistry doing "
          "what chemistry does. Our team met it with the 22-Step Healthy Touch Deep Cleaning System and won. Watch "
          "the last frame: real grout, no filter. Which reveal should we film next — tile, tub, or glass? Tell us "
          "below. Alexandria, Arlington, D.C. and Prince William. Follow for a transformation every Monday.", S_VAL),
    (FC, TAG_LINE, S_VAL),
    (SA, "Share the Reel with a poll sticker: “Be honest — did you think that grout was beige?” "
         "Yes / 100%. Save to the <b>Before/After</b> highlight.", S_VAL),
    (N, "Replaces the prior “Yohanna vs. hardwater” concept — that footage was not used.", S_VAL),
]))

# ---- TUE AUG 4
story.append(story_block("TUE AUG 4  |  STORY ONLY — REVIEW GRAPHIC #1",
    "Brand-template review graphic (sapphire background, golden five stars, white quote text) featuring a recent "
    "5-star review. Sticker: Yes/No — “Have you ever hired a professional cleaning team?” Save to the "
    "<b>Reviews</b> highlight."))

# ---- WED AUG 5
story.append(block("tip", "WED AUG 5  |  MAID SIMPLE #1 — STAINLESS STEEL (KEPT AS-IS)", [
    (F, "Reel, about 10 seconds, branded cover before posting.", S_VAL),
    (A, "ASMR spray-and-wipe audio with text overlay. No dialogue.", S_VAL),
    (H, "“Maid Simple: streak-free stainless in 10 seconds”", S_HOOK),
    (C, "Close-up demo on a fridge or dishwasher front: microfiber cloth glides, paper towel comparison flashes "
        "briefly, finish on the streak-free panel.", S_VAL),
    (CAP, "Maid Simple, tip #1: microfiber, not paper towels, on stainless steel. Zero streaks, zero lint. Save this "
          "for Sunday reset. Follow for a new pro tip every Wednesday.", S_VAL),
    (FC, TAG_LINE, S_VAL),
    (SA, "Share the Reel with a Yes/No sticker: “Did you know this?” Save to the <b>Service</b> highlight.", S_VAL),
    (N, "Carried over unchanged from the prior plan, except the spoken-Spanish option is dropped under the new audio "
        "rules.", S_VAL),
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
    (H, "“Step 14 of 22: appliance exteriors” — rotate numbered step captions through the clip.", S_HOOK),
    (C, "Time-lapse of a full kitchen clean compressed under 15 seconds: greasy stovetop first, then counters, "
        "sink, appliance fronts, with 22-Step captions rotating on screen. The numbered system is the differentiator "
        "no competitor can copy. Final wide shot held 2 seconds.", S_VAL),
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
story.append(block("tip", "WED AUG 12  |  MAID SIMPLE #2 — DUST TOP TO BOTTOM", [
    (F, "Reel, 10–15 seconds, branded cover before posting.", S_VAL),
    (A, "Trending audio or ASMR dusting sound, text overlay only. No dialogue.", S_VAL),
    (H, "“Maid Simple: why we always start at the ceiling”", S_HOOK),
    (C, "Quick clips in strict order: ceiling fan, shelf, baseboard, vacuum. An arrow overlay drops down the frame "
        "with each cut to make the gravity logic visible.", S_VAL),
    (CAP, "Maid Simple, tip #2: dust falls. Start with fans and shelves, finish with floors, and you only clean "
          "everything once. Save this order for your next whole-room clean. Follow for a new pro tip every "
          "Wednesday.", S_VAL),
    (FC, TAG_LINE, S_VAL),
    (SA, "Share the Reel with a question sticker: “What do you always forget to dust?” Screenshot the best "
         "answers for Thursday's answer round. Save to the <b>Service</b> highlight.", S_VAL),
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
    (H, "Five stars animating in over footage of the actual team at work.", S_HOOK),
    (C, "Pair the named quote with footage of the team that cleaned that home: arrival, detail shots, the finished "
        "rooms. Quote appears line by line in white on sapphire.", S_VAL),
    (CAP, "“Like always, they exceed every expectation.” Thank you, Jeff E. Referred for a reason — and "
          "this is the reason. Follow to meet the teams behind the reviews.", S_VAL),
    (FC, TAG_LINE, S_VAL),
    (SA, "Share the Reel with a poll sticker: “Best part of a freshly cleaned home?” Walking in the door / "
         "The smell / Not lifting a finger / The first shower. Save to the <b>Reviews</b> highlight.", S_VAL),
]))

# ---- MON AUG 17
story.append(block("ba", "MON AUG 17  |  BEFORE/AFTER REEL — UPHOLSTERY RESCUE", [
    (F, "Reel, under 15 seconds. Dirty shot first, hold the after shot a full 2 seconds, branded cover before "
        "posting.", S_VAL),
    (A, "ASMR extraction sound (very satisfying) or trending audio, text overlay only. No dialogue.", S_VAL),
    (H, "“That couch was gray. It is actually purple.”", S_HOOK),
    (C, "Dull, dusty cushion close-up first, extraction pass in real time, wipe transition to the true color, wide "
        "after shot held 2 full seconds.", S_VAL),
    (CAP, "Sofas collect more than crumbs — dust and fibers settle in and mute the color one shade at a time. One "
          "deep pass and the whole room wakes up. Share this with someone who loves a good reveal. Alexandria, "
          "Arlington, D.C. and Prince William. Follow for Monday transformations.", S_VAL),
    (FC, TAG_LINE, S_VAL),
    (SA, "Share the Reel with a slider sticker: “How satisfying was this?” Save to the <b>Before/After</b> "
         "highlight.", S_VAL),
]))

# ---- TUE AUG 18
story.append(story_block("TUE AUG 18  |  STORY ONLY — REVIEW GRAPHIC #3",
    "Brand-template review graphic, new review. Sticker: Yes/No — “Do you read reviews before trying a local "
    "business?” Save to the <b>Reviews</b> highlight."))

# ---- WED AUG 19
story.append(block("tip", "WED AUG 19  |  MAID SIMPLE #3 — THE TWO-TOWEL RULE", [
    (F, "Reel, about 10 seconds, branded cover before posting.", S_VAL),
    (A, "ASMR glass-squeak sound or trending audio, text overlay only. No dialogue.", S_VAL),
    (H, "“Maid Simple: the two-towel rule for glass and mirrors”", S_HOOK),
    (C, "10-second mirror demo: damp microfiber cleans, dry microfiber buffs, camera catches the zero-streak finish "
        "at an angle in raking light.", S_VAL),
    (CAP, "Maid Simple, tip #3: one damp microfiber to clean, one dry to buff. That second towel is the whole secret "
          "— it lifts the residue the first towel loosens, so nothing dries into a streak. Save this for your next "
          "mirror. Follow for a new pro tip every Wednesday.", S_VAL),
    (FC, TAG_LINE, S_VAL),
    (SA, "Share the Reel with a Yes/No sticker: “Did you know the second-towel trick?” Save to the "
         "<b>Service</b> highlight.", S_VAL),
]))

# ---- THU AUG 20
story.append(story_block("THU AUG 20  |  STORY ONLY — TEAM BEHIND-THE-SCENES",
    "Photo of a four-person team's morning load-out: labeled caddies, color-coded microfiber, HEPA vacuum. Sticker: "
    "poll — “Guess: how many microfiber cloths does one team go through in a day?” 10 / 25 / 50+. Reveal "
    "the real number in a second frame. Save to the <b>Our Team</b> highlight."))

# ---- FRI AUG 21
story.append(block("fri", "FRI AUG 21  |  SUDS AND SCIENCE #2 — BLEACH + GLASS CLEANER", [
    (F, "Reel or text-forward post, 15–20 seconds. Same visual system as part 1 (bottles, red X) so the series "
        "is instantly recognizable in the grid. Branded cover before posting.", S_VAL),
    (A, "Trending audio or soft music with text overlay. No dialogue, no voiceover — the month's two voiceover slots "
        "are Aug 7 and Aug 26.", S_VAL),
    (H, "“Bleach and glass cleaner do not belong in the same bucket.”", S_HOOK),
    (C, "Part 2 of the series: bottle labeled GLASS CLEANER slides in beside BLEACH, red X lands, key line appears: "
        "“ammonia + bleach = chloramine fumes.”", S_VAL),
    (CAP, "Suds and Science, part 2. Many glass cleaners contain ammonia, and ammonia plus bleach creates chloramine "
          "fumes that can leave you dizzy, short of breath, and sick. One product at a time, with the fan on. It is "
          "one reason professional teams carry separate, labeled supplies for every job. Save it, share it. Follow "
          "for more Suds and Science.", S_VAL),
    (FC, TAG_LINE, S_VAL),
    (SA, "Share the Reel with a poll sticker: “Which combination surprised you more?” Bleach + vinegar / "
         "Bleach + glass cleaner. Save to the <b>Service</b> highlight.", S_VAL),
]))

# ---- MON AUG 24
story.append(block("ba", "MON AUG 24  |  BEFORE/AFTER REEL — THE OVEN FINALE", [
    (F, "Reel, under 15 seconds. Dirty shot first, hold the after shot a full 2 seconds, branded cover before "
        "posting.", S_VAL),
    (A, "ASMR scrub-and-foam sound or trending audio, text overlay only. No dialogue.", S_VAL),
    (H, "“The inside of the oven counts too.”", S_HOOK),
    (C, "Baked-on oven interior first, scrub montage, then the door swings open on the gleaming after as the final "
        "beat — held 2 full seconds. Optional quick fridge-shelf cutaway mid-montage.", S_VAL),
    (CAP, "Baked-on grease thinks time is on its side. It is not. Ovens and fridges are the deep-clean finale for a "
          "reason — is this the best reveal of the month? You tell us in the comments. Alexandria, Arlington, D.C. "
          "and Prince William. Follow for Monday transformations.", S_VAL),
    (FC, TAG_LINE, S_VAL),
    (SA, "Share the Reel with a poll sticker: “How often does the oven get a deep clean at your place?” "
         "Monthly / Holidays only / No comment. Save to the <b>Before/After</b> highlight.", S_VAL),
]))

# ---- TUE AUG 25
story.append(story_block("TUE AUG 25  |  STORY ONLY — REVIEW GRAPHIC #4",
    "Brand-template review graphic, new review. Sticker: slider — “How much does a freshly cleaned home lower "
    "your stress?” Save to the <b>Reviews</b> highlight."))

# ---- WED AUG 26
story.append(block("tip", "WED AUG 26  |  MAID SIMPLE #4 — DWELL TIME  (VOICEOVER REEL 2 OF 2)", [
    (F, "Reel, 12–15 seconds with an on-screen countdown timer, branded cover before posting.", S_VAL),
    (A, "<b>Voiceover Reel 2 of 2</b> (calm, professional narration recorded off-camera) over soft music. Script: "
        "“Here is a pro secret: stop wiping so soon. Spray, then give it five minutes — that is dwell time, and "
        "it is printed right on the label. Let the chemistry do the scrubbing. Maid Simple, from The Maids of "
        "Virginia.”", S_VAL),
    (H, "“Maid Simple: stop wiping too soon”", S_HOOK),
    (C, "Spray a shower wall, timer overlay ticks forward in fast-motion while the product visibly works, then one "
        "effortless wipe reveals the clean stripe. Side text: “the label tells you the minutes.”", S_VAL),
    (CAP, "Maid Simple, tip #4: spray, then walk away. Every cleaner has a dwell time — the minutes it needs to sit "
          "wet and break soil down before you wipe. It is printed right on the label, and disinfectants do not "
          "disinfect without it. Spray the shower, go pour the coffee, come back to an easier job. Less scrubbing, "
          "better results. Save this one. Follow for a new pro tip every Wednesday.", S_VAL),
    (FC, TAG_LINE, S_VAL),
    (SA, "Share the Reel with a question sticker: “What should Maid Simple cover next?” Answers seed the "
         "September lineup. Save to the <b>Service</b> highlight.", S_VAL),
    (N, "Replaces the prior “vacuum before you mop” tip, which was below the pro-level bar for this "
        "series.", S_VAL),
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
    B + "<b>Why vinegar should never touch natural stone.</b> Acetic acid dissolves the calcium carbonate in "
        "marble, limestone, and travertine — those dull spots are etching, not stains.",
    B + "<b>How HEPA filtration works.</b> HEPA filters capture 99.97% of particles at 0.3 microns — the hardest "
        "size to trap; larger and smaller particles are caught at even higher rates — so fine dust and allergens "
        "stay in the vacuum instead of going back into the air. A natural brand story for our HEPA-equipped teams.",
    B + "<b>Why microfiber lifts instead of smears.</b> Split fibers create thousands of tiny edges and capillary "
        "channels that pull in oil and dust, where cotton and paper mostly push them around.",
    B + "<b>The science of hard water.</b> Dissolved calcium and magnesium bond with soap into scum and stay behind "
        "as mineral film when water evaporates — why bathrooms fog and faucets crust in the same spots.",
], SAPPHIRE))
story.append(Spacer(0, 6))
story.append(Paragraph(
    "September planning inputs already built into August: the Aug 26 question sticker (“What should Maid Simple "
    "cover next?”), the Aug 6 / Aug 13 Q+A round, and the poll results from every Friday story.", S_SMALL))

doc.build(story)

import pypdfium2 as pdfium
print("pages:", len(pdfium.PdfDocument(OUT)))
print("wrote", OUT)
