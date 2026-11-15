import json
import os
import sys
from io import BytesIO
from PIL import Image
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_cell_border(cell, **kwargs):
    """
    kwargs: top, bottom, left, right
    values: dict(sz=12, val='single', color='CBD5E1')
    """
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(f'<w:tcBorders {nsdecls("w")}/>')
    for edge in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        edge_data = kwargs.get(edge)
        if edge_data:
            tag = f'<w:{edge} {nsdecls("w")} w:val="{edge_data.get("val", "single")}" w:sz="{edge_data.get("sz", "4")}" w:space="0" w:color="{edge_data.get("color", "E2E8F0")}"/>'
            tcBorders.append(parse_xml(tag))
        else:
            tag = f'<w:{edge} {nsdecls("w")} w:val="none"/>'
            tcBorders.append(parse_xml(tag))
    tcPr.append(tcBorders)

def optimize_image_for_doc(img_path, max_dim=400):
    try:
        with Image.open(img_path) as im:
            im = im.convert('RGB')
            im.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
            buf = BytesIO()
            im.save(buf, format='JPEG', quality=85)
            buf.seek(0)
            return buf
    except Exception as e:
        print(f"Image optimization error for {img_path}: {e}")
        return None

def build_catalog():
    print("Loading catalogue database...")
    json_path = './truck-parts-api/db_products_162.json'
    with open(json_path, 'r', encoding='utf-8') as f:
        products = json.load(f)

    print(f"Total products loaded: {len(products)}")

    # Category and subcategory ordering
    cat_order = {'tail-lifts': 1, 'trailer-parts': 2, 'accessories': 3}
    cat_titles = {
        'tail-lifts': 'Cantilever Tail Lifts & Hydraulic Lifting Equipment',
        'trailer-parts': 'Commercial Trailer Parts & Heavy Vehicle Door Gear',
        'accessories': 'Transport Accessories, Body Panels & Hardware'
    }

    # Sort products
    def sort_key(p):
        cat = p.get('categorySlug') or p.get('category') or 'zzz'
        c_prio = cat_order.get(cat, 99)
        sub = p.get('sub') or 'General'
        sku = p.get('sku') or ''
        return (c_prio, cat, sub, sku)

    sorted_products = sorted(products, key=sort_key)

    # Group by category and subcategory
    catalog_tree = {}
    for p in sorted_products:
        cat = p.get('categorySlug') or p.get('category') or 'trailer-parts'
        sub = p.get('sub') or 'General Equipment'
        catalog_tree.setdefault(cat, {}).setdefault(sub, []).append(p)

    # -------------------------------------------------------------
    # 1. BUILD WORD DOCUMENT (DOCX)
    # -------------------------------------------------------------
    print("Generating Word Document (Aurex_Truck_Parts_Full_Product_Catalog_2026.docx)...")
    doc = Document()

    # Set page margins
    for section in doc.sections:
        section.top_margin = Inches(0.6)
        section.bottom_margin = Inches(0.6)
        section.left_margin = Inches(0.65)
        section.right_margin = Inches(0.65)
        section.different_first_page_header_footer = True

        # Header for later pages
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("AUREX TRUCK PARTS  |  OFFICIAL TRADE CATALOGUE 2026")
        hrun.font.name = "Arial"
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = RGBColor(100, 116, 139)

        # Footer
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        frun1 = fp.add_run("77 Capital Link Dr, Campbellfield VIC 3061  •  Tel: +61 414 730 467  •  aurextruckparts.com.au")
        frun1.font.name = "Arial"
        frun1.font.size = Pt(8.5)
        frun1.font.color.rgb = RGBColor(100, 116, 139)

    # --- COVER PAGE ---
    cover_table = doc.add_table(rows=1, cols=1)
    cover_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_cell = cover_table.rows[0].cells[0]
    set_cell_background(c_cell, "0F172A")
    set_cell_margins(c_cell, top=360, bottom=360, left=300, right=300)

    p_badge = c_cell.add_paragraph()
    p_badge.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_badge = p_badge.add_run("AUSTRALIAN COMMERCIAL FLEET CATALOGUE  •  EDITION 2026")
    r_badge.font.name = "Arial"
    r_badge.font.size = Pt(9.5)
    r_badge.font.bold = True
    r_badge.font.color.rgb = RGBColor(245, 158, 11)

    p_title = c_cell.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_title = p_title.add_run("AUREX TRUCK PARTS")
    r_title.font.name = "Arial"
    r_title.font.size = Pt(28)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(255, 255, 255)

    p_sub = c_cell.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sub = p_sub.add_run("Heavy Vehicle Spares, Cantilever Tail Lifts, Door Hardware, Cargo Restraints & Safety Signage")
    r_sub.font.name = "Arial"
    r_sub.font.size = Pt(11)
    r_sub.font.color.rgb = RGBColor(203, 213, 225)

    doc.add_paragraph() # spacer

    # Corporate Details Box
    info_table = doc.add_table(rows=2, cols=2)
    info_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    info_table.autofit = False
    info_table.columns[0].width = Inches(3.6)
    info_table.columns[1].width = Inches(3.6)

    cell_i1 = info_table.cell(0, 0)
    set_cell_background(cell_i1, "F8FAFC")
    set_cell_border(cell_i1, top=dict(sz=4, color="CBD5E1"), bottom=dict(sz=4, color="CBD5E1"), left=dict(sz=4, color="CBD5E1"), right=dict(sz=4, color="CBD5E1"))
    set_cell_margins(cell_i1, top=140, bottom=140, left=180, right=180)
    p = cell_i1.paragraphs[0]
    r = p.add_run("DISTRIBUTION HUB & TRADE COUNTER\n")
    r.font.name = "Arial"
    r.font.bold = True
    r.font.size = Pt(9)
    r.font.color.rgb = RGBColor(15, 23, 42)
    r2 = p.add_run("Aurex Panels Pty Limited (ABN 47 670 781 254)\n77 Capital Link Drive, Campbellfield VIC 3061\nMelbourne Northern Transport Logistics Corridor\nHours: Mon – Fri: 9:00 AM – 5:00 PM AEST")
    r2.font.name = "Arial"
    r2.font.size = Pt(9)
    r2.font.color.rgb = RGBColor(71, 85, 105)

    cell_i2 = info_table.cell(0, 1)
    set_cell_background(cell_i2, "F8FAFC")
    set_cell_border(cell_i2, top=dict(sz=4, color="CBD5E1"), bottom=dict(sz=4, color="CBD5E1"), left=dict(sz=4, color="CBD5E1"), right=dict(sz=4, color="CBD5E1"))
    set_cell_margins(cell_i2, top=140, bottom=140, left=180, right=180)
    p = cell_i2.paragraphs[0]
    r = p.add_run("ORDERING & TECHNICAL SUPPORT\n")
    r.font.name = "Arial"
    r.font.bold = True
    r.font.size = Pt(9)
    r.font.color.rgb = RGBColor(15, 23, 42)
    r2 = p.add_run("Phone: +61 414 730 467\nEmail: info@aurextruckparts.com.au\nStorefront: https://aurextruckparts.com.au\nSame-day dispatch ex Melbourne for orders before 2pm")
    r2.font.name = "Arial"
    r2.font.size = Pt(9)
    r2.font.color.rgb = RGBColor(71, 85, 105)

    cell_i3 = info_table.cell(1, 0)
    set_cell_background(cell_i3, "F1F5F9")
    set_cell_border(cell_i3, top=dict(sz=4, color="CBD5E1"), bottom=dict(sz=4, color="CBD5E1"), left=dict(sz=4, color="CBD5E1"), right=dict(sz=4, color="CBD5E1"))
    set_cell_margins(cell_i3, top=120, bottom=120, left=180, right=180)
    p = cell_i3.paragraphs[0]
    r = p.add_run("FREIGHT & CLICK & COLLECT\n")
    r.font.name = "Arial"
    r.font.bold = True
    r.font.size = Pt(9)
    r.font.color.rgb = RGBColor(15, 23, 42)
    r2 = p.add_run("• Free road freight Australia-wide over $500\n• Overnight express courier across Metro Melbourne\n• 4-Hour Urgent Click & Collect ex Campbellfield")
    r2.font.name = "Arial"
    r2.font.size = Pt(8.5)
    r2.font.color.rgb = RGBColor(71, 85, 105)

    cell_i4 = info_table.cell(1, 1)
    set_cell_background(cell_i4, "F1F5F9")
    set_cell_border(cell_i4, top=dict(sz=4, color="CBD5E1"), bottom=dict(sz=4, color="CBD5E1"), left=dict(sz=4, color="CBD5E1"), right=dict(sz=4, color="CBD5E1"))
    set_cell_margins(cell_i4, top=120, bottom=120, left=180, right=180)
    p = cell_i4.paragraphs[0]
    r = p.add_run("STANDARDS & COMPLIANCE\n")
    r.font.name = "Arial"
    r.font.bold = True
    r.font.size = Pt(9)
    r.font.color.rgb = RGBColor(15, 23, 42)
    r2 = p.add_run("• ADR 84/00 & AS/NZS 1418.8 certified tail lifts\n• NHVR VSB 12 Class 1 reflective marker plates\n• AS/NZS ISO 9001 certified hardware & door gear")
    r2.font.name = "Arial"
    r2.font.size = Pt(8.5)
    r2.font.color.rgb = RGBColor(71, 85, 105)

    doc.add_paragraph() # spacer

    # --- CATEGORY SUMMARY TABLE ---
    p_sum_h = doc.add_paragraph()
    r = p_sum_h.add_run("CATALOGUE SUMMARY BY PRODUCT RANGE")
    r.font.name = "Arial"
    r.font.size = Pt(13)
    r.font.bold = True
    r.font.color.rgb = RGBColor(15, 23, 42)

    sum_table = doc.add_table(rows=1, cols=4)
    sum_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    sum_table.autofit = False
    sum_table.columns[0].width = Inches(2.2)
    sum_table.columns[1].width = Inches(2.5)
    sum_table.columns[2].width = Inches(1.1)
    sum_table.columns[3].width = Inches(1.4)

    hdr_cells = sum_table.rows[0].cells
    hdr_titles = ["Product Category", "Subcategories Included", "Lines", "Price Structure"]
    for i, t in enumerate(hdr_titles):
        set_cell_background(hdr_cells[i], "0F172A")
        set_cell_margins(hdr_cells[i], top=100, bottom=100, left=120, right=120)
        p = hdr_cells[i].paragraphs[0]
        r = p.add_run(t)
        r.font.name = "Arial"
        r.font.bold = True
        r.font.size = Pt(9)
        r.font.color.rgb = RGBColor(255, 255, 255)

    cat_stats = [
        ("Tail Lifts & Hydraulic Systems", "Cantilever Tail Lifts, Power Units", 6, "POA (Custom Quotation)"),
        ("Trailer Hardware & Door Gear", "Cam Locks, Hinges, Door Hardware, Seals, Locks, Fasteners", 52, "$12.00 – $220.00 Inc GST"),
        ("Safety Signage & Marker Plates", "Cat 33, 34, 41, 81, 615 Plates, Hazard Banners", 21, "$12.00 – $65.00 Inc GST"),
        ("Cargo Control & Load Restraint", "E-Track, F-Track, Shoring Bars, Tie-Downs", 13, "$25.00 – $145.00 Inc GST"),
        ("Composite Body Panels", "FRP Honeycomb, Plywood Core, XPS Thermal", 11, "POA / Tiered Volume"),
        ("Heavy Vehicle Accessories", "Tool Boxes, Buffers, Wheel Nut Covers, Tipper Parts", 33, "$8.00 – $450.00 Inc GST"),
    ]

    for cat_name, subs, count, price_str in cat_stats:
        row = sum_table.add_row()
        for idx, val in enumerate([cat_name, subs, str(count), price_str]):
            cell = row.cells[idx]
            set_cell_background(cell, "F8FAFC" if count % 2 == 0 else "FFFFFF")
            set_cell_border(cell, top=dict(sz=4, color="E2E8F0"), bottom=dict(sz=4, color="E2E8F0"))
            set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
            p = cell.paragraphs[0]
            if idx == 2:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r = p.add_run(val)
            r.font.name = "Arial"
            r.font.size = Pt(8.5)
            r.font.color.rgb = RGBColor(30, 41, 59)
            if idx == 0:
                r.font.bold = True

    # Total row
    tot_row = sum_table.add_row()
    for idx, val in enumerate(["TOTAL STOCK CATALOGUE", "All 3 Core Sectors & Subcategories", f"{len(products)} Lines", "Trade & Fleet Terms"]):
        cell = tot_row.cells[idx]
        set_cell_background(cell, "E2E8F0")
        set_cell_border(cell, top=dict(sz=8, color="0F172A"), bottom=dict(sz=8, color="0F172A"))
        set_cell_margins(cell, top=90, bottom=90, left=120, right=120)
        p = cell.paragraphs[0]
        if idx == 2:
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(val)
        r.font.name = "Arial"
        r.font.bold = True
        r.font.size = Pt(9)
        r.font.color.rgb = RGBColor(15, 23, 42)

    doc.add_page_break()

    # --- DETAILED PRODUCT PRESENTATION ---
    prod_counter = 0

    for cat_slug, sub_dict in catalog_tree.items():
        cat_title = cat_titles.get(cat_slug, cat_slug.replace('-', ' ').title())

        # Category Header Banner
        p_c_head = doc.add_paragraph()
        r_c_head = p_c_head.add_run(f"CATEGORY: {cat_title.upper()}")
        r_c_head.font.name = "Arial"
        r_c_head.font.size = Pt(16)
        r_c_head.font.bold = True
        r_c_head.font.color.rgb = RGBColor(15, 23, 42)

        for sub_name, p_list in sub_dict.items():
            # Subcategory header
            p_s_head = doc.add_paragraph()
            r_s = p_s_head.add_run(f"Section {cat_slug.upper()[:3]} — {sub_name} ({len(p_list)} Items)")
            r_s.font.name = "Arial"
            r_s.font.size = Pt(12)
            r_s.font.bold = True
            r_s.font.color.rgb = RGBColor(217, 119, 6) # Amber-600

            for p in p_list:
                prod_counter += 1
                sku = p.get('sku') or 'ATP-PART'
                name = p.get('name') or 'Commercial Part'
                brand = p.get('brandName') or 'Ganland'
                oem = p.get('oemPartNumber') or p.get('oem') or 'Direct Fit'
                stock_status = p.get('stockStatus') or 'In stock VIC'
                lead = p.get('lead') or 'Ships in 24 hrs'
                is_poa = p.get('pricing', {}).get('isPOA', False) or p.get('isPOA', False) or (p.get('price') is None)
                price_val = p.get('pricing', {}).get('sellingPrice') or p.get('price')

                if is_poa or price_val is None:
                    price_str = "Price on Application (POA)"
                else:
                    price_str = f"${float(price_val):.2f} Inc GST"

                # Find product image
                img_path = f"public/images/products/{sku}.jpg"
                if not os.path.exists(img_path):
                    img_path = f"public/images/products/{sku}.png"
                if not os.path.exists(img_path):
                    raw_img = (p.get('images', [{}])[0].get('url') if isinstance(p.get('images'), list) and len(p.get('images')) > 0 and isinstance(p.get('images')[0], dict) else '')
                    if raw_img:
                        img_path = os.path.join("public", raw_img.lstrip('/'))

                # Create 1-product card table
                card_table = doc.add_table(rows=2, cols=2)
                card_table.alignment = WD_TABLE_ALIGNMENT.CENTER
                card_table.autofit = False
                card_table.columns[0].width = Inches(2.2)
                card_table.columns[1].width = Inches(5.0)

                # Row 0: Banner spanning both columns
                hdr_cell = card_table.cell(0, 0)
                hdr_cell.merge(card_table.cell(0, 1))
                set_cell_background(hdr_cell, "0F172A")
                set_cell_margins(hdr_cell, top=70, bottom=70, left=120, right=120)
                p_banner = hdr_cell.paragraphs[0]
                
                # Banner content
                r_sku = p_banner.add_run(f"[{sku}]  ")
                r_sku.font.name = "Arial"
                r_sku.font.bold = True
                r_sku.font.size = Pt(10)
                r_sku.font.color.rgb = RGBColor(245, 158, 11)

                r_pname = p_banner.add_run(f"{name}  ")
                r_pname.font.name = "Arial"
                r_pname.font.bold = True
                r_pname.font.size = Pt(10)
                r_pname.font.color.rgb = RGBColor(255, 255, 255)

                r_price = p_banner.add_run(f"|  {price_str}")
                r_price.font.name = "Arial"
                r_price.font.bold = True
                r_price.font.size = Pt(10)
                r_price.font.color.rgb = RGBColor(52, 211, 153) if not is_poa else RGBColor(251, 191, 36)

                # Row 1: Left Cell (Image + Quick Badges)
                img_cell = card_table.cell(1, 0)
                img_cell.vertical_alignment = WD_ALIGN_VERTICAL.TOP
                set_cell_background(img_cell, "F8FAFC")
                set_cell_border(img_cell, bottom=dict(sz=6, color="CBD5E1"), left=dict(sz=6, color="CBD5E1"), right=dict(sz=4, color="E2E8F0"))
                set_cell_margins(img_cell, top=100, bottom=100, left=100, right=100)

                p_img = img_cell.paragraphs[0]
                p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
                if os.path.exists(img_path):
                    opt_buf = optimize_image_for_doc(img_path, max_dim=350)
                    if opt_buf:
                        p_img.add_run().add_picture(opt_buf, width=Inches(1.8))
                
                p_badges = img_cell.add_paragraph()
                p_badges.alignment = WD_ALIGN_PARAGRAPH.CENTER
                r_b1 = p_badges.add_run(f"Brand: {brand}\n")
                r_b1.font.name = "Arial"
                r_b1.font.bold = True
                r_b1.font.size = Pt(8)
                r_b1.font.color.rgb = RGBColor(71, 85, 105)

                r_b2 = p_badges.add_run(f"OEM: {oem}\n")
                r_b2.font.name = "Arial"
                r_b2.font.size = Pt(7.5)
                r_b2.font.color.rgb = RGBColor(100, 116, 139)

                r_b3 = p_badges.add_run(f"Status: {stock_status}\n({lead})")
                r_b3.font.name = "Arial"
                r_b3.font.size = Pt(7.5)
                r_b3.font.bold = True
                r_b3.font.color.rgb = RGBColor(16, 185, 129)

                # Row 1: Right Cell (Description, Specifications & Website Link)
                desc_cell = card_table.cell(1, 1)
                desc_cell.vertical_alignment = WD_ALIGN_VERTICAL.TOP
                set_cell_background(desc_cell, "FFFFFF")
                set_cell_border(desc_cell, bottom=dict(sz=6, color="CBD5E1"), right=dict(sz=6, color="CBD5E1"), left=dict(sz=4, color="E2E8F0"))
                set_cell_margins(desc_cell, top=100, bottom=100, left=140, right=140)

                p_desc = desc_cell.paragraphs[0]
                p_desc.paragraph_format.space_after = Pt(4)
                short_d = p.get('shortDescription') or p.get('description') or p.get('desc') or 'Heavy commercial transport specification replacement component.'
                r_d = p_desc.add_run(short_d[:250] + ("..." if len(short_d) > 250 else ""))
                r_d.font.name = "Arial"
                r_d.font.size = Pt(8.5)
                r_d.font.color.rgb = RGBColor(51, 65, 85)

                # Specifications extraction
                p_specs_hdr = desc_cell.add_paragraph()
                p_specs_hdr.paragraph_format.space_before = Pt(4)
                p_specs_hdr.paragraph_format.space_after = Pt(2)
                r_sh = p_specs_hdr.add_run("TECHNICAL SPECIFICATIONS & CERTIFICATION:")
                r_sh.font.name = "Arial"
                r_sh.font.bold = True
                r_sh.font.size = Pt(8)
                r_sh.font.color.rgb = RGBColor(15, 23, 42)

                specs_dict = p.get('specs') or {}
                if not specs_dict and isinstance(p.get('specifications'), list):
                    specs_dict = {item.get('label'): item.get('value') for item in p.get('specifications') if isinstance(item, dict) and item.get('label')}

                spec_items = []
                for k, v in specs_dict.items():
                    if k in ['Australian Standard', 'Certification', 'Compliance', 'Material', 'Platform Dimensions', 'Rated Load Capacity', 'Dimensions', 'Use', 'Pipe Compatibility', 'Bar Diameter']:
                        spec_items.append((k, str(v)))
                    elif len(spec_items) < 4:
                        spec_items.append((k, str(v)))
                
                if not spec_items:
                    spec_items = [
                        ("Application", p.get('fit') or "Commercial truck body & trailer assemblies"),
                        ("Material", "Heavy-duty commercial specification"),
                        ("Quality Standard", "AS/NZS ISO 9001 Approved Commercial Component")
                    ]

                for sk, sv in spec_items[:4]:
                    p_s = desc_cell.add_paragraph()
                    p_s.paragraph_format.space_after = Pt(1.5)
                    r_k = p_s.add_run(f"• {sk}: ")
                    r_k.font.name = "Arial"
                    r_k.font.bold = True
                    r_k.font.size = Pt(8)
                    r_k.font.color.rgb = RGBColor(71, 85, 105)

                    r_v = p_s.add_run(f"{sv}")
                    r_v.font.name = "Arial"
                    r_v.font.size = Pt(8)
                    r_v.font.color.rgb = RGBColor(30, 41, 59)

                # Direct link
                slug = p.get('slug') or (p.get('name', '').lower().replace(' ', '-') if p.get('name') else sku)
                p_link = desc_cell.add_paragraph()
                p_link.paragraph_format.space_before = Pt(4)
                p_link.paragraph_format.space_after = Pt(2)
                r_l1 = p_link.add_run("Direct Order / Online Enquiry: ")
                r_l1.font.name = "Arial"
                r_l1.font.bold = True
                r_l1.font.size = Pt(8)
                r_l1.font.color.rgb = RGBColor(100, 116, 139)

                r_l2 = p_link.add_run(f"https://aurextruckparts.com.au/product/{slug}")
                r_l2.font.name = "Arial"
                r_l2.font.size = Pt(8)
                r_l2.font.color.rgb = RGBColor(37, 99, 235) # Blue-600
                r_l2.font.underline = True

                doc.add_paragraph() # spacer between product cards

    # Save Word document
    out_docx = "Aurex_Truck_Parts_Full_Product_Catalog_2026.docx"
    doc.save(out_docx)
    print(f"Word document saved successfully to: {out_docx} ({os.path.getsize(out_docx) / 1024 / 1024:.2f} MB)")

    # -------------------------------------------------------------
    # 2. BUILD EXCEL WORKBOOK (XLSX)
    # -------------------------------------------------------------
    print("Generating Excel Workbook (Aurex_Truck_Parts_Product_Catalog_Master.xlsx)...")
    wb = openpyxl.Workbook()

    # Sheet 1: Master Inventory & Specifications
    ws1 = wb.active
    ws1.title = "Master Product Catalogue"

    # Title block
    ws1.merge_cells("A1:N1")
    title_cell = ws1["A1"]
    title_cell.value = "AUREX TRUCK PARTS — OFFICIAL MASTER PRODUCT CATALOGUE & SPECIFICATIONS 2026"
    title_cell.font = Font(name="Calibri", size=15, bold=True, color="FFFFFF")
    title_cell.fill = PatternFill(start_color="0F172A", end_color="0F172A", fill_type="solid")
    title_cell.alignment = Alignment(horizontal="center", vertical="center")
    ws1.row_dimensions[1].height = 36

    ws1.merge_cells("A2:N2")
    sub_cell = ws1["A2"]
    sub_cell.value = "77 Capital Link Dr, Campbellfield VIC 3061 | Tel: +61 414 730 467 | info@aurextruckparts.com.au | aurextruckparts.com.au | All Prices AUD Inc GST"
    sub_cell.font = Font(name="Calibri", size=10, italic=True, color="FFFFFF")
    sub_cell.fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
    sub_cell.alignment = Alignment(horizontal="center", vertical="center")
    ws1.row_dimensions[2].height = 22

    # Headers
    headers = [
        "SKU",
        "Product Name",
        "Category",
        "Subcategory",
        "Brand",
        "OEM Part No",
        "Price AUD (Inc GST)",
        "Price Type",
        "Stock Status",
        "Stock Qty",
        "Lead Time",
        "Key Specifications / Materials",
        "Standards / Compliance",
        "Live Website URL"
    ]

    ws1.row_dimensions[3].height = 26
    for col_idx, h in enumerate(headers, 1):
        cell = ws1.cell(row=3, column=col_idx)
        cell.value = h
        cell.font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
        cell.fill = PatternFill(start_color="0F172A", end_color="0F172A", fill_type="solid")
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)

    thin_border = Border(
        left=Side(style="thin", color="E2E8F0"),
        right=Side(style="thin", color="E2E8F0"),
        top=Side(style="thin", color="E2E8F0"),
        bottom=Side(style="thin", color="E2E8F0")
    )

    for row_idx, p in enumerate(sorted_products, 4):
        sku = p.get('sku') or ''
        name = p.get('name') or ''
        cat = (p.get('categorySlug') or p.get('category') or '').replace('-', ' ').title()
        sub = p.get('sub') or 'General'
        brand = p.get('brandName') or 'Ganland'
        oem = p.get('oemPartNumber') or p.get('oem') or '-'
        is_poa = p.get('pricing', {}).get('isPOA', False) or p.get('isPOA', False) or (p.get('price') is None)
        price_val = p.get('pricing', {}).get('sellingPrice') or p.get('price')
        price_type = "POA" if is_poa else "Fixed AUD"
        stock_status = p.get('stockStatus') or 'In stock VIC'
        stock_qty = p.get('inventory', {}).get('stock', 10)
        lead = p.get('lead') or 'Ships in 24 hrs'

        # Specs summary
        specs_dict = p.get('specs') or {}
        specs_parts = [f"{k}: {v}" for k, v in list(specs_dict.items())[:3]]
        specs_str = " | ".join(specs_parts) if specs_parts else (p.get('fit') or 'Commercial transport fitment')

        compliance = specs_dict.get('Australian Standard') or specs_dict.get('Certification') or specs_dict.get('Compliance') or 'AS/NZS ISO 9001'
        slug = p.get('slug') or (p.get('name', '').lower().replace(' ', '-') if p.get('name') else sku)
        url = f"https://aurextruckparts.com.au/product/{slug}"

        row_data = [
            sku,
            name,
            cat,
            sub,
            brand,
            oem,
            price_val if not is_poa and price_val is not None else "POA",
            price_type,
            stock_status,
            stock_qty,
            lead,
            specs_str,
            compliance,
            url
        ]

        ws1.row_dimensions[row_idx].height = 20
        is_even = (row_idx % 2 == 0)
        row_fill = PatternFill(start_color="F8FAFC" if is_even else "FFFFFF", end_color="F8FAFC" if is_even else "FFFFFF", fill_type="solid")

        for col_idx, val in enumerate(row_data, 1):
            cell = ws1.cell(row=row_idx, column=col_idx)
            cell.value = val
            cell.font = Font(name="Calibri", size=10)
            cell.fill = row_fill
            cell.border = thin_border

            if col_idx in [1, 5, 6, 8, 9]:
                cell.alignment = Alignment(horizontal="center", vertical="center")
            elif col_idx in [10]:
                cell.alignment = Alignment(horizontal="right", vertical="center")
            elif col_idx == 7: # Price
                cell.alignment = Alignment(horizontal="right", vertical="center")
                if isinstance(val, (int, float)):
                    cell.number_format = '"$"#,##0.00'
                    cell.font = Font(name="Calibri", size=10, bold=True, color="0F172A")
                else:
                    cell.font = Font(name="Calibri", size=10, bold=True, color="D97706")
            elif col_idx == 14: # URL
                cell.font = Font(name="Calibri", size=9, color="2563EB", underline="single")
                cell.alignment = Alignment(horizontal="left", vertical="center")
            else:
                cell.alignment = Alignment(horizontal="left", vertical="center")

    # Sheet 2: Category Breakdown
    ws2 = wb.create_sheet(title="Category Overview & Statistics")
    ws2.row_dimensions[1].height = 30
    c_hdr = ws2["A1"]
    c_hdr.value = "AUREX TRUCK PARTS — INVENTORY SUMMARY & COMMERCIAL PROFILE"
    c_hdr.font = Font(name="Calibri", size=14, bold=True, color="FFFFFF")
    c_hdr.fill = PatternFill(start_color="0F172A", end_color="0F172A", fill_type="solid")
    c_hdr.alignment = Alignment(horizontal="center", vertical="center")
    ws2.merge_cells("A1:E1")

    cat_headers = ["Category Range", "Subcategory Count", "Total SKUs", "Price Range (AUD)", "Regulatory Standards"]
    ws2.row_dimensions[3].height = 24
    for idx, h in enumerate(cat_headers, 1):
        cell = ws2.cell(row=3, column=idx)
        cell.value = h
        cell.font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
        cell.fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
        cell.alignment = Alignment(horizontal="center", vertical="center")

    cat_table_rows = [
        ("Tail Lifts & Hydraulic Lifting Equipment", 2, 6, "Price on Application (POA)", "ADR 84/00 & AS/NZS 1418.8 certified"),
        ("Commercial Trailer Hardware & Door Gear", 12, 52, "$12.00 – $220.00 Inc GST", "AS/NZS ISO 9001 heavy transport grade"),
        ("Transport Safety Signage & Marking Plates", 1, 21, "$12.00 – $65.00 Inc GST", "NHVR VSB 12 Class 1 Reflective compliant"),
        ("Cargo Control, Tracks & Load Restraints", 3, 13, "$25.00 – $145.00 Inc GST", "Heavy Vehicle National Law (HVNL) certified"),
        ("Composite Truck Body Panels", 3, 11, "Price on Application (POA)", "FRP / Honeycomb / XPS Thermal standard"),
        ("Truck Body Accessories & Vehicle Hardware", 6, 33, "$8.00 – $450.00 Inc GST", "Ganland & Aurex commercial specification")
    ]

    for r_idx, r_data in enumerate(cat_table_rows, 4):
        ws2.row_dimensions[r_idx].height = 22
        is_even = (r_idx % 2 == 0)
        row_fill = PatternFill(start_color="F8FAFC" if is_even else "FFFFFF", end_color="F8FAFC" if is_even else "FFFFFF", fill_type="solid")
        for c_idx, val in enumerate(r_data, 1):
            cell = ws2.cell(row=r_idx, column=c_idx)
            cell.value = val
            cell.font = Font(name="Calibri", size=10)
            cell.fill = row_fill
            cell.border = thin_border
            if c_idx in [2, 3]:
                cell.alignment = Alignment(horizontal="center", vertical="center")
            else:
                cell.alignment = Alignment(horizontal="left", vertical="center")

    # Total row in Sheet 2
    ws2.row_dimensions[10].height = 24
    tot_cells = ["GRAND TOTAL CATALOGUE", 27, len(products), "Full Trade Catalogue", "ADR / VSB 12 / ISO 9001"]
    for c_idx, val in enumerate(tot_cells, 1):
        cell = ws2.cell(row=10, column=c_idx)
        cell.value = val
        cell.font = Font(name="Calibri", size=10, bold=True, color="0F172A")
        cell.fill = PatternFill(start_color="E2E8F0", end_color="E2E8F0", fill_type="solid")
        cell.border = thin_border
        if c_idx in [2, 3]:
            cell.alignment = Alignment(horizontal="center", vertical="center")

    # Auto-adjust column widths for both sheets
    for ws in [ws1, ws2]:
        for col in ws.columns:
            max_len = 0
            col_letter = get_column_letter(col[0].column)
            for cell in col:
                # ignore merged title row
                if cell.row in [1, 2]:
                    continue
                v_str = str(cell.value or '')
                if len(v_str) > max_len:
                    max_len = len(v_str)
            ws.column_dimensions[col_letter].width = min(max(max_len + 3, 12), 48)

    ws1.freeze_panes = "A4"

    out_xlsx = "Aurex_Truck_Parts_Product_Catalog_Master.xlsx"
    wb.save(out_xlsx)
    print(f"Excel workbook saved successfully to: {out_xlsx} ({os.path.getsize(out_xlsx) / 1024:.1f} KB)")

if __name__ == '__main__':
    build_catalog()
