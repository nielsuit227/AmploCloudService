from django.contrib.auth.models import User
from django.core.files.storage import FileSystemStorage
from django.db.models import Sum, Count, IntegerField, F, Func, Avg, Max, Min, Case, When, Prefetch, Q
from app.models import AssetType, Asset, Prediction, Issue, Ticket, Comment, Technician, AuthEmails, Part, Notification
import numpy as np
from datetime import timedelta, datetime
import string, json, time, io, csv
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated


def splitTime(timedelta):
    if timedelta is None:
        return '-'
    else:
        if timedelta.days >= 5:
            return str(timedelta.days) + 'd ' + str(int(timedelta.seconds / 60) // 60) + 'h'
        elif timedelta.days != 5:
            return str(timedelta.days) + 'd ' + str(int(timedelta.seconds / 60) // 60) + 'h ' + str(int(timedelta.seconds / 60) % 60) + 'm'
        else: 
            return str(int(timedelta.seconds / 60) // 60) + 'h ' + str(int(timedelta.seconds / 60) % 60) + 'm'


# Assets
############################################################
class getAssets(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            try:
                data = request.data
                search = data['search']
            except:
                search = ""
            assets = list(Asset.objects.prefetch_related('type').filter(
                Q(type__type__icontains=search) |
                Q(location__icontains=search) |
                Q(serial__icontains=search) |
                Q(version__icontains=search) |
                Q(commission_date__icontains=search) |
                Q(parts__icontains=search))
                .values('pk', 'type__type', 'location', 'serial', 'version', 'commission_date', 'parts'))
            for i, asset in enumerate(assets):
                if asset['commission_date'] is not None:
                    assets[i]['commission_date'] = asset['commission_date'].strftime('%a %d %b %Y, %H:%M')
            return Response(assets, status=200)
        except Exception as e:
            return Response('Error has occured: %s' % e, status=200)

class getAssetTypes(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            types = list(AssetType.objects.values('type', 'description', 'new_price'))
            return Response(types)
        except Exception as e:
            return Response('Error has occured: %s' % e)

class addAssetType(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            data = request.data
            asset = AssetType(
                type=data['type'],
                description=data['description'],
                new_price=data['price']
            ).save()
            return Response('Success')
        except Exception as e:
            return Response('Error has occured: %s' % e)

class addAssets(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            data = request.data
            type = AssetType.objects.filter(type=data['type'])[0]
            for i in range(len(data['locations'])):
                Asset(
                    type=type,
                    location= data['locations'][i],
                    serial= data['serials'][i],
                    version= data['versions'][i],
                    commission_date=datetime.now(),
                ).save()
            return Response('Success')
        except Exception as e:
            print(e)
            return Response('Error has occured: %s' % e)

class delAssetType(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            AssetType.objects.filter(type=request.data['type'])[0].delete()
            return Response('Success')
        except Exception as e:
            return Response('Error has occured: %s' % e)

class uploadAssets(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            dataString = request.FILES['file'].read().decode('utf-8')
            ioString = io.StringIO(dataString)
            reader = csv.reader(ioString, delimiter=',')
            headers = next(reader)
            headers = [i.lower() for i in headers]
            try:
                typeHeader = [headers.index(i) for i in headers if 'type' in i][0]
                locationHeader = [headers.index(i) for i in headers if 'location' in i][0]
                serialHeader = [headers.index(i) for i in headers if 'serial' in i][0]
                versionHeader = [headers.index(i) for i in headers if 'version' in i][0]
                print(typeHeader)
            except:
                return Response("Headers not found ('type', 'location', 'serial', 'version')")
            for row in reader:
                try:
                    type = AssetType.objects.filter(type=row[typeHeader])[0]
                except:
                    return Response("Unknown Asset Type in .csv")
                Asset(
                    type=type,
                    location=row[locationHeader],
                    serial=row[serialHeader],
                    version=row[versionHeader],
                    commission_date=datetime.now()
                ).save()
            return Response('Success')
        except Exception as e: 
            print(e)
            return Response('Failed to save Assets. Error: %s' % e)


# Comments
############################################################
class getComments(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            comments = list(Ticket.objects\
                            .filter(pk=request.data['issue'])\
                            .prefetch_related(Prefetch('comment', queryset=Comment.objects.select_related('user')))\
                            .values('comment__comment', 'comment__created', 'comment__user__first_name', 'comment__pk',
                                    'comment__user__last_name'))
            return Response(comments)
        except Exception as e:
            return Response('Error has occured: %s' % e)

class addComment(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            # Comment
            print(request.data)
            print(request.user)
            ticket = Ticket.objects.filter(pk=request.data['ticket'])[0]
            user = User.objects.filter(username=request.user)[0]
            comment = Comment(
                ticket=ticket,
                user=user,
                comment=request.data['comment'],
                created=datetime.now(),
            )
            comment.save()
            # Notification
            if ticket.assignee is not None:
                Notification(
                    target=ticket.assignee,
                    ticket=ticket,
                    notification='%s commented on ticket %i' % (request.user, ticket.pk),
                    creator=user,
                    date=datetime.now()
                ).save()
            return Response('Success')
        except Exception as e:
            return Response("Failed to create comment: %s" % e)

class deleteComment(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            Comment.objects.filter(pk=request.data['pk']).delete()
            return Response('Success')
        except Exception as e:
            return Response('Failed to delete comment: %s' % e)

class editComment(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            # Comment
            comment = Comment.objects.filter(pk=request.data['id'])[0]
            comment.comment = request.data['newPost']
            comment.save()
            # Notification
            ticket = comment.ticket
            user = comment.user
            if ticket.assignee is not None:
                Notification(
                    target=ticket.user,
                    ticket=ticket,
                    notification='%s %s edited comment on ticket %i' % (user.first_name, user.last_name, ticket.pk),
                    creator=user,
                    date=datetime.now()
                ).save()
            return Response('Success')
        except Exception as e:
            return Response('Failed to edit comment: %s' % e)

# Issues
############################################################
class getIssues(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            issues = list(Issue.objects.all().values('pk', 'title', 'description', 'template'))
            return Response(issues)
        except Exception as e:
            return Response('Failed to edit comment: %s' % e)

class addIssue(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            print(request)
            print(request.data)
            issue = Issue(
                title=request.data['title'],
                description=request.data['description'],
                template=request.data['file'],
            ).save()
            return Response('Success')
        except Exception as e:
            return Response('Failed to add issue: %s' % e)

class delIssue(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            Issue.objects.filter(title=request.data['title']).delete()
            return Response('Success')
        except Exception as e:
            return Response('Failed to add issue: %s' % e)

class assignIssue(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            ticket = Ticket.objects.filter(pk=request.data['ticket'])[0]
            issue = Issue.objects.filter(pk=request.data['issue'])[0]
            ticket.issue = issue
            ticket.save()
            return Response('Succes')
        except Exception as e:
            return Response('Failed to add issue: %s' % e)

class uploadWorkTemplate(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try: 
            req_file = request.FILES['file']
            fs = FileSystemStorage()
            file = fs.save(req_file.name, req_file)
            return Response(fs.url(file))
        except Exception as e:
            return Response('Failed to upload work template: %s' % e)

# Functions
############################################################
class dashboardCards(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            # Initial Context
            context = defaultdict(list)
            # Get Tickets
            tickets = Ticket.objects.filter(date_failure__gte=datetime.now() - timedelta(days=31))
            oldTickets = Ticket.objects.filter(date_failure__lte=datetime.now() - timedelta(days=31)).filter(date_failure__gte=datetime.now() - timedelta(days=62))
            totalNew = len(tickets)
            totalOld = len(oldTickets)
            if totalNew > 4:
                # Issues
                context['val'].append(totalNew)
                # Predicted
                context['val'].append(round(tickets.aggregate(m=Count(Case(When(predicted=True, then=1), output=IntegerField())))['m'] / totalNew * 100, 1))
                # MTTR
                mttr = tickets.aggregate(ttr=Avg(Func(F('date_operational'), F('date_service'), function='age')))['ttr']
                context['val'].append(splitTime(mttr))
                # MTTD
                mttd = tickets.aggregate(ttr=Avg(Func(F('date_service'), F('date_failure'), function='age')))['ttr']
                context['val'].append(splitTime(mttd))
                # MCAV
                try:
                    MCAV = tickets.aggregate(tc=Sum('cost'))['tc'] / \
                            Asset.objects.filter(pk__in=Ticket.objects.all().values('asset_id')).prefetch_related('type')\
                        .aggregate(tc=Sum('type__new_price'))['tc'] * 100
                except:
                    MCAV = 0
                context['val'].append(round(MCAV, 1))
                # Rework
                try:
                    reworkRate = tickets.values('asset_id', 'issue').annotate(dcount=Count('issue'))\
                        .filter(dcount__gte=2).aggregate(reworks=Sum('dcount')-Count('dcount'))['reworks'] / totalNew * 100
                except:
                    reworkRate = 0
                context['val'].append(round(reworkRate, 1))
                # Open Issues
                context['val'].append(int(len(tickets.filter(status='open'))))
                # MTBF
                mtbf = tickets.aggregate(mtbf=Func(Max(F('date_failure')), Min(F('date_failure')), function='age'))['mtbf'] / totalNew
                context['val'].append(splitTime(mtbf))
            if totalOld > 4:
                # Calculate old specs
                oldMttr = oldTickets.aggregate(ttr=Avg(Func(F('date_operational'), F('date_service'), function='age')))['ttr']
                oldMttd = oldTickets.aggregate(ttr=Avg(Func(F('date_service'), F('date_failure'), function='age')))['ttr']
                oldMtbf = oldTickets.aggregate(mtbf=Func(Max(F('date_failure')), Min(F('date_failure')), function='age'))['mtbf'] / totalOld
                oldPredicted = oldTickets.aggregate(m=Count(Case(When(predicted=True, then=1), output=IntegerField())))['m'] / totalOld * 100
                oldOpen = int(len(oldTickets.filter(status='open')))
                try:
                    oldMcav = oldTickets.aggregate(tc=Sum('cost'))['tc'] / \
                            Asset.objects.filter(pk__in=Ticket.objects.all().values('asset_id')).prefetch_related('type')\
                        .aggregate(tc=Sum('type__new_price'))['tc'] * 100
                except:
                    oldMcav = 0
                try:
                    oldRework = oldTickets.values('asset_id', 'issue').annotate(dcount=Count('issue'))\
                        .filter(dcount__gte=2).aggregate(reworks=Sum('dcount')-Count('dcount'))['reworks'] / totalOld * 100
                except:
                    oldRework = 0
                # Feed Derivatives
                # Issues
                context['der'].append(round(100 * totalNew / totalOld - 100, 2))
                # Predicted
                context['der'].append(round(context['val'][1] - oldPredicted, 2))
                # MTTR
                context['der'].append(round(100 * mttr.total_seconds() / oldMttr.total_seconds() - 100, 2))
                # MTTD
                context['der'].append(round(100 * mttd.total_seconds() / oldMttd.total_seconds() - 100, 2))
                # MCAV
                context['der'].append(round(context['val'][4] - oldMcav, 2))
                # Rework
                context['der'].append(round(context['val'][5] - oldRework, 2))
                # Open
                context['der'].append(oldOpen)
                # MTBF
                context['der'].append(round(100 * mtbf.total_seconds() / oldMtbf.total_seconds() - 100, 2))
            return Response(context)
        except Exception as e:
            return Response('Failed to get KPI data: %s' % e)

class dashboardGraphs(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            technicians = list(Ticket.objects.filter(date_failure__gte=datetime.now() - timedelta(days=31)).select_related('technician').annotate(name=F('technician__name')).values('name').annotate(value=Count('technician')))
            issues = list(Ticket.objects.filter(date_failure__gte=datetime.now() - timedelta(days=31)).select_related('issue').annotate(name=F('issue__title')).values('name').annotate(value=Count('issue__title')))
            data = {
                'technicians': technicians,
                'issues': issues
            }
            return Response(data)
        except Exception as e:
            return Response('Failed to get graph data: %s' % e)
   
class predictionData(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            searchQuery = request.data['search']
            if searchQuery is None:
                searchQuery = ""
            assets = list(Asset.objects.prefetch_related('type')\
                .filter(Q(type__type__icontains=searchQuery) |
                        Q(type__description__icontains=searchQuery) |
                        Q(location__icontains=searchQuery) |
                        Q(version__icontains=searchQuery) |
                        Q(parts__icontains=searchQuery))\
                .values('type__type', 'location', 'pk'))
            predictionData = []
            for asset in assets:
                predictions = list(np.array(list(Prediction.objects.filter(asset=asset['pk']).order_by('date')\
                    .values_list('transformer_winding', 'degraded_capacitor', 'anomalies', 'date')[:24])).T)
                if len(predictions) != 0:
                    data = []
                    predictions[3] = [int(time.mktime(i.timetuple())) for i in predictions[3]]
                    for i in range(len(predictions[0])):
                        data.append({
                            'xaxis': round(predictions[3][i], 2),
                            'Transformer': round(predictions[0][i], 2),
                            'Capacitor': round(predictions[1][i], 2),
                            'Anomalies': round(predictions[2][i], 2),
                        })
                    predictionData.append({
                        'pk': asset['pk'],
                        'type': asset['type__type'],
                        'location': asset['location'],
                        'data': data,
                        'soh': max(0, 100 - (predictions[0][-1] + predictions[1][-1]) * 60 - predictions[2].sum() / 10)
                    })
            predictionData = sorted(predictionData, key= lambda i: i['soh'])
            return Response(predictionData)
        except Exception as e:
            return Response('Failed to get prediction template: %s' % e)

class searchForum(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            searchQuery = request.data['search']
            statusQuery = request.data['status']
            periodQuery = request.data['period']
            sortQuery = request.data['sort']
            assignee = request.data['assignee']
            if searchQuery is None:
                searchQuery = ""
            if statusQuery is None:
                statusQuery = ""
            if periodQuery == "":
                periodQuery = "2000-1-1"
            elif periodQuery == "1":
                periodQuery = datetime.today() - timedelta(days=7)
            elif periodQuery == '2':
                periodQuery = datetime.today() - timedelta(days=31)
            elif periodQuery == '3':
                periodQuery = datetime.today() - timedelta(days=365)
            if len(searchQuery) == 4:
                if searchQuery[0] == 'F' and searchQuery[2] == 'A':
                    tickets = Ticket.objects\
                        .filter(asset=searchQuery[3])\
                        .filter(pk=searchQuery[1])\
                        .filter(Q(status__icontains=statusQuery))\
                        .filter(date_failure__gte=periodQuery)\
                        .order_by('-date_failure')\
                        .prefetch_related('user', Prefetch('asset', 
                        queryset=Asset.objects.select_related('type')))\
                        .values('pk', 'asset__pk', 'title', 'status', 'date_failure', 
                        'asset__type__type', 'asset__version', 'asset__location')
                    return Response(list(tickets))
            tickets = Ticket.objects.prefetch_related('user', 'assignee', Prefetch('asset', queryset=Asset.objects.select_related('type')))\
                .filter(Q(status__icontains=searchQuery) |
                        Q(title__icontains=searchQuery) |
                        Q(user__first_name__icontains=searchQuery) |
                        Q(user__last_name__icontains=searchQuery) |
                        Q(asset__location__icontains=searchQuery) |
                        Q(asset__type__type__icontains=searchQuery) |
                        Q(asset__version__icontains=searchQuery) |
                        Q(asset__parts__icontains=searchQuery)  |
                        Q(description__icontains=searchQuery))\
                .filter(status__icontains=statusQuery)\
                .filter(date_failure__gte=periodQuery) \
                .order_by(sortQuery)
            if assignee != "":
                tickets = tickets.filter(assignee=User.objects.filter(pk=assignee)[0])
            tickets = tickets.values('pk', 'asset__pk', 'title', 'status', 'date_failure', 'asset__type__type', 'asset__version',
                        'asset__location', 'assignee__first_name', 'assignee__last_name')
            for i in range(len(tickets)):
                tickets[i]['date_failure'] = tickets[i]['date_failure'].strftime('%a %d %b %Y, %H:%M')
            return Response(list(tickets))
        except Exception as e:
            return Response('Failed to find tickets: %s' % e)


# Notifications
############################################################
class getNotifications(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            user = User.objects.filter(username=request.user)[0]
            notifications = list(Notification.objects.prefetch_related('creator').filter(target=user).values('pk', 'notification', 'ticket', 'creator__username', 'read', 'date').order_by('-date'))
            for i, notification in enumerate(notifications):
                notifications[i]['date'] = notification['date'].strftime('%a %d %b %Y, %H:%M')
            return Response(notifications)
        except Exception as e:
            return Response('Failed to get notifications: %s' % e)

class markRead(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            pks = request.data['notifications']
            for pk in pks:
                notification = Notification.objects.filter(pk=pk)[0]
                notification.read = True
                notification.save()
            return Response('Success')
        except Exception as e:
            return Response('Failed to mark notification as read: %s' % e)

# Parts
############################################################
class getParts(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            parts = Part.objects.values('name', 'price', 'vendor', 'stock' , 'location')
            return Response(list(parts))
        except Exception as e:
            return Response('Failed to mark notification as read: %s' % e)

class addPart(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            nParts = len(request.data['parts'])
            for i in range(nParts):
                part = Part(
                    name=request.data['parts'][i],
                    price=request.data['prices'][i],
                    vendor=request.data['vendors'][i],
                ).save()
            return Response('Success')
        except Exception as e:
            return Response('Failed to add part: %s' % e)

class delPart(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try: 
            part = Part.objects.filter(name=request.data['name'])[0]
            part.delete()
            return Response('Success')
        except Exception as e:
            return Response('Failed to delete part: %s' % e)

# Settings
############################################################
class updateSettings(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        data = request.data
        setting = data['setting']
        try:
            if setting == 'Assets':
                asset = Asset.objects.filter(serial=data['old']['serial'])[0]
                asset.type = AssetType.objects.filter(type=data['new']['type__type'])[0]
                asset.location = data['new']['location']
                asset.serial = data['new']['serial']
                asset.version = data['new']['version']
                asset.commission_date = datetime.utcfromtimestamp(int(data['date']) + 2*3600)
                asset.parts = data['new']['parts']
                asset.save()
            elif setting == 'Asset Types':
                asset = AssetType.objects.filter(type=data['old']['type'])[0]
                asset.type = data['new']['type']
                asset.description = data['new']['description']
                asset.new_price = data['new']['new_price']
                asset.save()
            elif setting == 'Issues':
                issue = Issue.objects.filter(title=data['old']['title'])[0]
                issue.title = data['new']['title']
                issue.description = data['new']['description']
                issue.template = data['new']['template']
                issue.save()
            elif setting == 'Technicians':
                technician = Technician.objects.filter(
                    name=data['old']['name'],
                    company=data['old']['company']
                )[0]
                technician.name = data['new']['name']
                technician.email = data['new']['email']
                technician.company = data['new']['company']
                technician.location = data['new']['location']
                technician.save()
            elif setting == 'Users':
                user = User.objects.filter(username=data['old']['username'])[0]
                user.username = data['new']['username']
                user.first_name = data['new']['first_name']
                user.last_name = data['new']['last_name']
                user.email = data['new']['email']
                user.is_superuser = data['new']['is_superuser'] == 'Yes'
                user.save()
            elif setting == 'Parts':
                part = Part.objects.filter(name=data['old']['name'])[0]
                part.name = data['new']['name']
                part.price = data['new']['price']
                part.vendor = data['new']['vendor']
                part.save()
            return Response('Success')
        except Exception as e:
            return Response('Failed to edit settings: %s' % e)

# Technicians
############################################################
class addTechnician(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            technician = Technician(
                name=request.data['name'],
                email=request.data['email'],
                company=request.data['company'],
                location=request.data['location'],
            ).save()
            if request.data['forumAccount'] == 'true':
                name = request.data['name'].split(' ')
                first_name = name[0]
                last_name = name[1]
                passwordLookup = string.ascii_letters + string.digits + string.punctuation
                pw = ''
                for ind in np.random.randint(0, len(passwordLookup), 12):
                    pw += passwordLookup[ind]
                User.objects.create_user(
                    username=first_name+last_name,
                    email=request.data['email'],
                    password=pw,
                    first_name=first_name,
                    last_name=last_name,
                    is_superuser=False
                ).save()
            return Response('Success')
        except Exception as e:
            return Response('Failed to add technician: %s' % e)

class delTechnician(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            Technicina.objects.filter(name=request.data['name'], email=request.data['email']).delete()
            return Response('Success')
        except Exception as e:
            return Response('Failed to remove technician: %s' % e)

class getTechnicians(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            technicians = list(Technician.objects.values('name', 'email', 'company', 'location'))
            return Response(technicians)
        except Exception as e:
            return Response('Failed to get technicians: %s' % e)

class assignTechnician(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            # Technician
            ticket = Ticket.objects.filter(pk=request.data['ticket'])[0]
            technician = Technician.objects.filter(name=request.data['name'], email=request.data['email'])[0]
            ticket.technician = technician
            ticket.save()
            # Notification
            if ticket.assignee is not None:
                Notification(
                    target=ticket.assignee,
                    ticket=ticket,
                    notification='%s assigned to ticket %i' % (technician.name, ticket.pk),
                    creator=User.objects.filter(username=request.user)[0],
                    date=datetime.now()
                ).save()
            return Response('Success')
        except Exception as e:
            return Response('Failed to assign technician: %s' % e)

# Tickets
############################################################
class getTicketInfo(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            ticketInfo = list(Ticket.objects\
                            .filter(pk=request.data['ticket'])\
                            .prefetch_related('user', 'techncian', 'assignee', 'issue',
                            Prefetch('asset', queryset=Asset.objects.select_related('type')))\
                .values('asset__type__type', 'asset__location', 'asset__version', 'asset__parts', 'asset__commission_date', 'asset__pk', 'user__first_name', 'user__last_name', 'assignee__first_name', 'assignee__last_name', 'technician__name', 'technician__company', 'technician__location', 'technician__email', 'date_failure', 'date_service', 'date_operational', 'issue__title', 'issue__pk', 'new_parts', 'cost', 'predicted', 'pk', 'title', 'status', 'description'))[0]
            ticketInfo['user'] = ticketInfo['user__first_name'] + ' ' + ticketInfo['user__last_name']
            if ticketInfo['assignee__first_name'] != None:
                ticketInfo['assignee'] = ticketInfo['assignee__first_name'] + ' ' + ticketInfo['assignee__last_name']
            else:
                ticketInfo['assignee'] = 'Unassigned'
            for dateCol in ['date_failure', 'date_service', 'date_operational', 'asset__commission_date']:
                if ticketInfo[dateCol] is not None:
                    ticketInfo[dateCol] = ticketInfo[dateCol].strftime('%a %d %b %Y, %H:%M')
            return Response(ticketInfo)
        except Exception as e:
            return Response('Failed to get ticket info: %s' % e)

class getTickets(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            tickets = list(Ticket.objects\
                    .prefetch_related('asset')\
                    .values('pk', 'asset__pk', 'title', 'status')\
                    .order_by('-date_failure'))
            return Response(tickets)
        except Exception as e:
            return Response('Failed to get tickets: %s' % e)

class changeTicketStatus(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            # Ticket
            ticket = Ticket.objects.filter(pk=request.data['ticket'])[0]
            ticket.status = request.data['status']
            ticket.save()
            # Notification
            if ticket.assignee is not None:
                Notification(
                    target=ticket.assignee,
                    ticket=ticket,
                    notification='Ticket %i, status is now %s' % (ticket.pk, ticket.status),
                    creator=User.objects.filter(username=request.user)[0],
                    date=datetime.now()
                ).save()
            return Response('Success')
        except Exception as e:
            return Response("Failed to update ticket status: %s" % e)

class createTicket(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            asset = Asset.objects.filter(pk=request.data['asset'])[0]
            user = User.objects.filter(username=request.user)[0]
            if request.data['assignee'] != '':
                assignee = User.objects.filter(pk=request.data['assignee'])[0]
            else:
                assignee = None
            if request.data['issue'] != "":
                ticket = Ticket(
                    title=request.data['title'],
                    description=request.data['description'],
                    status='open',
                    date_failure=datetime.now(),
                    asset=asset,
                    user=user,
                    issue=Issue.objects.filter(pk=request.data['issue'])[0],
                    predicted=False,
                    assignee=assignee,
                ).save()
            else:
                ticket = Ticket(
                    title=request.data['title'],
                    description=request.data['description'],
                    status='open',
                    date_failure=datetime.now(),
                    asset=asset,
                    user=user,
                    predicted=False,
                    assignee=assignee,
                ).save()
            return Response('Success')
        except Exception as e:
            return Response("Failed to create ticket: %s" % e)

class deleteTicket(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            print(request.data['ticket'])
            ticket = Ticket.objects.filter(pk=request.data['ticket'])
            ticket.delete()
            return Response('Success')
        except Exception as e:
            return Response("Failed to delete ticket: %s" % e)

class updateTicket(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            # Update Ticket
            ticket = Ticket.objects.filter(pk=request.data['ticket'])[0]
            if request.data['tag'] == 'date_failure':
                if int(request.data['data']) == 0:
                    ticket.date_failure = None
                else:
                    ticket.date_failure = datetime.utcfromtimestamp(int(request.data['data']) + 3600)
            elif request.data['tag'] == 'date_service':
                if int(request.data['data']) == 0:
                    ticket.date_service = None
                else:
                    ticket.date_service = datetime.utcfromtimestamp(int(request.data['data']) + 3600)
            elif request.data['tag'] == 'date_operational':
                if int(request.data['data']) == 0:
                    ticket.date_operational = None
                else:
                    ticket.date_operational = datetime.utcfromtimestamp(int(request.data['data']) + 60 * 60 * 2)
            ticket.save()
            # Make Notification
            if ticket.assignee is not None:
                Notification(
                    target=ticket.assignee,
                    ticket=ticket,
                    notification='Ticket %i, %s updated.' % (ticket.pk, request.data['tag']),
                    creator=User.objects.filter(username=request.user)[0],
                    date=datetime.now()
                ).save()
            return Response('Success')
        except Exception as e:
            return Response('Failed to update ticket: %s' % e)

class getNewTicketIndex(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            max = Ticket.objects.aggregate(m=Max('pk'))['m'] + 1
            return Response(max)
        except Exception as e:
            return Response('Failed to update ticket: %s' % e)
# Users
############################################################
class addUser(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            email = AuthEmails.objects.filter(email=request.data['email'])
            if len(email) == 1:
                email[0].delete()
                user = User.objects.create_user(
                    username=request.data['username'],
                    email=request.data['email'],
                    password=request.data['password'],
                    first_name=request.data['first'],
                    last_name=request.data['last'],
                    is_superuser=False,
                )
            return Response('Success')
        except Exception as e:
            return Response('Failed to add user email: %s' % e)

class getUsers(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            users = list(User.objects.order_by('id').values('id', 'username', 'first_name', 'last_name', 'email',  'date_joined', 'last_login', 'is_superuser'))
            for i, user in enumerate(users):
                users[i]['name'] = user['first_name'] + ' ' + user['last_name']
                if user['is_superuser'] == True:
                    users[i]['is_superuser'] = 'Yes'
                else:
                    users[i]['is_superuser'] = 'No'
                users[i]['date_joined'] = user['date_joined'].strftime("%a %d %b %Y")
                try:
                    users[i]['last_login'] = user['last_login'].strftime("%a %d %b %Y")
                except:
                    users[i]['last_login'] = 'n/a'
            return Response(users)
        except Exception as e:
            return Response('Failed to get users: %s' % e)

class getUser(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            user = User.objects.filter(username=request.user).values('first_name', 'last_name')[0]
            return Response(user)
        except Exception as e:
            return Response('Failed to get user: %s' % e)

class delUser(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            User.objects.filter(id=request.data['id']).delete()
            return Response('Success')
        except Exception as e:
            return Response('Failed to delete user: %s' % e)            
    
class assignUser(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            ticket = Ticket.objects.filter(pk=request.data['ticket'])[0]
            first, last = request.data['assignee'].split(' ')
            ticket.assignee = User.objects.filter(first_name=first, last_name=last)[0]
            ticket.save()
            return Response('Success')
        except Exception as e:
            return Response('Failed to assign user: %s' % e)  

class addEmail(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            for email in request.data['emails']:
                AuthEmails(email=email).save()
            return Response('Success')
        except Exception as e:
            return Response("Failed to add accounts: %s" % e)

class checkEmail(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, format=None):
        try:
            emails = [x['email'] for x in AuthEmails.objects.values('email')]
            if request.data['email'] in emails:
                return Response('Success')
            else:
                return Response('Access Denied.')
        except Exception as e:
            return Response("Failed to authenticate email: %s" % e)
        