import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {RestApiComponent} from './restapi/restapi.component';
import {LoginComponent} from './login/login.component';
import {RegisterComponent} from './register/register.component';
import { AuthGuard } from './shared/auth.guard';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { CreateTopicComponent } from './create-topic/create-topic.component';
import { FeedsComponent } from './feeds/feeds.component';
import { TopicDetailsComponent } from './topic-details/topic-details.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { CommentModerationComponent } from './comment-moderation/comment-moderation.component';
import { TopicListComponent } from './topic-list/topic-list.component';
import { CategoryListComponent } from './category-list/category-list.component';
import { GareportComponent } from './gareport/gareport.component';


const appRoutes: Routes = [
    {
        path: '',
        component: LoginComponent,
    },
    {
        path: 'login',
        component: LoginComponent,
    },
    {
        path: 'register',
        component: RegisterComponent,
    },
    {
        path: 'forum-register-test',
        component: RegisterComponent
    },
    {
        path: 'restapi',
        component: HomeComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'ga',
        component: GareportComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'forgot-password',
        component: ForgotPasswordComponent
    },
    {
        path: 'create-topic',
        component: CreateTopicComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'topics',
        component: FeedsComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'topic/:id',
        component: TopicDetailsComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'profile/edit',
        component: UserProfileComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'reportlist',
        component: CommentModerationComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'topiclist',
        component: TopicListComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'categorylist',
        component: CategoryListComponent,
        canActivate: [AuthGuard]
    }

];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}
