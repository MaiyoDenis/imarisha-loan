from flask import Blueprint, request, jsonify, send_file
from app.services.bi_integration_service import bi_service
import logging

bp = Blueprint('bi_integration', __name__, url_prefix='/api/bi-integration')

@bp.route('/tools', methods=['GET'])
def get_available_tools():
    """Get list of available BI tools"""
    try:
        tools = bi_service.get_available_tools()
        return jsonify({
            'tools': tools,
            'total': len(tools)
        })
    except Exception as e:
        logging.error(f"Error getting BI tools: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/export/members', methods=['GET'])
def export_members():
    """Export member data in specified format"""
    try:
        format = request.args.get('format', 'csv').lower()
        branch_id = request.args.get('branch_id', type=int)
        
        if format not in ['csv', 'json', 'excel', 'parquet']:
            return jsonify({'error': 'Unsupported format. Use: csv, json, excel, or parquet'}), 400
        
        filters = {}
        if branch_id:
            filters['branch_id'] = branch_id
        
        result = bi_service.export_member_data(format=format, **filters)
        
        if 'error' in result:
            return jsonify(result), 400
        
        return send_file(
            request=request,
            content=result['content'],
            mimetype=result['content_type'],
            as_attachment=True,
            download_name=result['filename']
        )
    
    except Exception as e:
        logging.error(f"Error exporting members: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/export/loans', methods=['GET'])
def export_loans():
    """Export loan data in specified format"""
    try:
        format = request.args.get('format', 'csv').lower()
        branch_id = request.args.get('branch_id', type=int)
        status = request.args.get('status')
        
        if format not in ['csv', 'json', 'excel', 'parquet']:
            return jsonify({'error': 'Unsupported format. Use: csv, json, excel, or parquet'}), 400
        
        filters = {}
        if branch_id:
            filters['branch_id'] = branch_id
        if status:
            filters['status'] = status
        
        result = bi_service.export_loan_data(format=format, **filters)
        
        if 'error' in result:
            return jsonify(result), 400
        
        return send_file(
            request=request,
            content=result['content'],
            mimetype=result['content_type'],
            as_attachment=True,
            download_name=result['filename']
        )
    
    except Exception as e:
        logging.error(f"Error exporting loans: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/powerbi/config', methods=['GET'])
def get_powerbi_config():
    """Get Power BI configuration"""
    try:
        config = bi_service.powerbi.get_report_config()
        return jsonify(config)
    except Exception as e:
        logging.error(f"Error getting Power BI config: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/powerbi/embed-token', methods=['GET'])
def get_powerbi_embed_token():
    """Get Power BI embed token"""
    try:
        report_id = request.args.get('report_id')
        
        if not report_id:
            return jsonify({'error': 'report_id is required'}), 400
        
        token = bi_service.powerbi.get_embed_token(report_id)
        
        if not token:
            return jsonify({'error': 'Failed to generate embed token'}), 500
        
        return jsonify(token)
    except Exception as e:
        logging.error(f"Error getting Power BI embed token: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/tableau/config', methods=['GET'])
def get_tableau_config():
    """Get Tableau configuration"""
    try:
        config = bi_service.tableau.get_report_config()
        return jsonify(config)
    except Exception as e:
        logging.error(f"Error getting Tableau config: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/export/formats', methods=['GET'])
def get_export_formats():
    """Get available export formats"""
    try:
        formats = [
            {
                'format': 'csv',
                'name': 'CSV',
                'description': 'Comma-Separated Values - Compatible with Excel and most BI tools',
                'extension': '.csv',
                'mimeType': 'text/csv'
            },
            {
                'format': 'json',
                'name': 'JSON',
                'description': 'JavaScript Object Notation - Universal data format',
                'extension': '.json',
                'mimeType': 'application/json'
            },
            {
                'format': 'excel',
                'name': 'Excel',
                'description': 'Microsoft Excel - Professional spreadsheet format',
                'extension': '.xlsx',
                'mimeType': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            },
            {
                'format': 'parquet',
                'name': 'Parquet',
                'description': 'Parquet - Optimized columnar format for big data and BI tools',
                'extension': '.parquet',
                'mimeType': 'application/octet-stream'
            }
        ]
        
        return jsonify({
            'formats': formats,
            'total': len(formats)
        })
    except Exception as e:
        logging.error(f"Error getting export formats: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/integration-guide', methods=['GET'])
def get_integration_guide():
    """Get BI integration guide"""
    try:
        guide = {
            'powerbi': {
                'name': 'Power BI Integration',
                'steps': [
                    'Get your Power BI workspace ID and dataset ID',
                    'Set environment variables: POWERBI_CLIENT_ID, POWERBI_CLIENT_SECRET, POWERBI_TENANT_ID',
                    'Call /api/bi-integration/powerbi/embed-token to get embed token',
                    'Use the token to embed Power BI reports in your application'
                ],
                'docs': 'https://docs.microsoft.com/en-us/power-bi/developer/'
            },
            'tableau': {
                'name': 'Tableau Integration',
                'steps': [
                    'Set up Tableau Server or Online',
                    'Set environment variables: TABLEAU_SERVER, TABLEAU_USERNAME, TABLEAU_PASSWORD',
                    'Export data using /api/bi-integration/export/members or /api/bi-integration/export/loans',
                    'Create data sources in Tableau from the exported files'
                ],
                'docs': 'https://help.tableau.com/current/server/en-us/data_connections.htm'
            },
            'google_data_studio': {
                'name': 'Google Data Studio Integration',
                'steps': [
                    'Create a Google Data Studio account',
                    'Connect to the API using the REST connector',
                    'Use endpoints: /api/bi-integration/export/members, /api/bi-integration/export/loans',
                    'Create visualizations in Data Studio'
                ],
                'docs': 'https://support.google.com/datastudio/'
            },
            'metabase': {
                'name': 'Metabase Integration',
                'steps': [
                    'Set up Metabase server',
                    'Connect to the database directly or use API',
                    'Create questions and dashboards',
                    'Share dashboards across your organization'
                ],
                'docs': 'https://www.metabase.com/docs/'
            }
        }
        
        return jsonify(guide)
    except Exception as e:
        logging.error(f"Error getting integration guide: {str(e)}")
        return jsonify({'error': str(e)}), 500
