import { Component, Pipe, PipeTransform } from '@angular/core';
import { AuthorizationService } from './shared/authorization.service';
import { ApisService } from './services/apis.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	title = 'app';
	isLoggedIn: boolean = false;
	constructor(private _auth: AuthorizationService){}
}

@Pipe({ name: 'commentDateFormat' })
export class CommentDateFormatPipe implements PipeTransform {
	transform(value: any, args?: any): any {
		const date = new Date();
		const date1 = new Date(value);
		console.log(date1.getHours());
		console.log(date1.getMinutes());
		const timeDiff = Math.abs(date.getTime() - date1.getTime()) / 3600000;
		// console.log(time)
	    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
	    return timeDiff;
	}
}
@Pipe({ name: 'arrayToCommaString' })
export class ArrayToCommaStringPipe implements PipeTransform {
	transform(value: any, args?: any): any {
		let arrToStr = '';
		value.forEach((data, index) => {
			arrToStr += data.name;
			if(index < (value.length - 1)){
				arrToStr += ', ';
			}
		})
		return arrToStr;
	}
}
@Pipe({
  	name: 'filter'
})
export class FilterPipe implements PipeTransform {
  	transform(items: any[], searchText: string): any[] {
  		console.log(searchText)
	    if(!items) return [];
	    if(!searchText) return items;
		searchText = searchText.toLowerCase();
		return items.filter( it => {
	      	return it.eng_title.toLowerCase().includes(searchText);
	    });
   	}
}

@Pipe({ name: 'removeBackSlash' })
export class RemoveBackSlashPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    return value.replace(/\\/g, '');
  }
}

@Pipe({ name: 'createEllipsis' })
export class CreateEllipsisPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    return value.substring(0, 100)+'...';
  }
}
@Pipe({ name: 'getChannelName' })
export class GetChannelNamePipe implements PipeTransform {
	constructor(private apiService: ApisService){}
  	transform(value: any, args?: any): any {
  		let channelName = this.apiService.channels.find(x => x.id == value);
	    return channelName.name;
	}
}

@Pipe({ name: 'decodeEmojis' })
export class DecodeEmojisPipe implements PipeTransform {
  	transform(value: any, args?: any): any {
  		return decodeURIComponent(value)
	      .trim()
	      .replace(/\n\n*\n/, "\n\n");
	}
}

@Pipe({ name: 'createTopicUrl' })
export class CreateTopicUrlPipe implements PipeTransform {
	constructor(private apiService: ApisService){}
  	transform(value: any, args?: any): any {
  		// console.log(value)
  		let url = '';
  		if(Number(value.langId) == 3 || Number(value.langId) == 6){
  			return ('https://www.forum.com/topic/' + value.tSlug + '-' + value.tId + '.html').replace('--', '-');
  		}	
  		else{
  			return ('https://www.forum.com/'+this.apiService.getLang(value.langId)+'/' + 'topic/' + value.tSlug + '-' + value.tId + '.html').replace('--', '-');
  		}
  		// return value.this.apiService.getLang(value.langId))
	}
}

@Pipe({ name: 'getCategoryName' })
export class GetCategoryNamePipe implements PipeTransform { 
    // specify every argument individually   
    transform(catID: any, langId: any, categories: any): any { 
    	if(catID){
	    	let catDetails = categories.filter(x => (x['termId'] == catID && x['term_details.langId']));
	    	if(catDetails.length > 0)
	    		return catDetails[0]['term_details.termDetailDesc'];
	    	else
	    		return 'Uncategorized'
    	}
    }
    // or use a rest parameter
    // transform(value: any, ...args: any[]): any { }
}



