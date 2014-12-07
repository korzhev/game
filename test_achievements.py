# -*- encoding: utf8 -*-

user_data = {                           # это данные о пользователе
	"completed_achievements": [1,2],    # это его законченные достижения, id достижений
	"permanent_params": {               # это его постоянные данные (для данных из одной игры тоже самое происходит)
		"qCount":100,                   # количество вопросов
		"aCount":39,                    # количество верно и вовремя ответов
		"time":1123,                    # игровое время
		"gCount":20,                    # количество игр
		"wCount":3                      # количество побед
	},
	"last_game_params": {
        "qCount":20,
        "aCount":10,
        "time":1123,
        "win":1                         # победил в последней игре
    },
}

achievements = {                        # это список условий получения достидений из бд, где, ключи - id из бд
	1:{                                 # параметры аналогичны параметрам у пользователей
		"permanent": True,
		"params": {
	        "qCount":100,
	        "aCount":0,
	        "time":0,
	        "gCount":0,
	        "wCount":0
	    }
    },
    2:{
        "permanent": True,
        "params": {
	        "qCount":0,
	        "aCount":20,
	        "time":0,
	        "gCount":0,
	        "wCount":0
	    }
    },
    3:{
        "permanent": True,
        "params": {
			"qCount":200,
			"aCount":0,
			"time":0,
			"gCount":0,
			"wCount":0
		}
    },
    4:{
        "permanent": True,
        "params": {
	        "qCount":0,
	        "aCount":30,
	        "time":0,
	        "gCount":0,
	        "wCount":0
	    }
    },
    5:{
        "permanent": False,
        "params": {
            "qCount":0,
            "aCount":8,
            "time":0,
            "win":1             # победил 1, неважно 0, непобедил 2
        }
    },
}

def check_achievements(achievements, user_data):            # функция получния новых достижений по окончанию игры
	achievements_keys = set(achievements.keys())            # получаем id достижений
	user_keys = set(user_data['completed_achievements'])    # получаем id полученных уже пользователем достижений
	uncomplited_achievements_keys = achievements_keys.difference(user_keys) # находим незаконченные достижения
	received_achieves=[]                                    # список достижений, которые получит пользователь
	for key in uncomplited_achievements_keys:               # начинаем проверку д
		achievement = achievements[key]                     # выбираем достижение
		if achievement['permanent']:                        # определяем какую инфу о пользователе рассматривать
			user_data_params = user_data['permanent_params']    # постоянные достижения
		else:
			user_data_params = user_data['last_game_params']    # или за последнюю игру
		get_achieve = True                                  # по умолчанию считаем, что получит достижение
		for k in achievement['params']:                     # проходимся по условиям достижения
			if k == 'time':                        # одно из особых условий достижений - время, чем меньше его тем лучше
				if user_data_params[k] > achievement['params'][k] and achievement['params'][k] != 0:
															# если затрачено больше времени чем надо или оно не важно
					get_achieve = False                     # не получаем достижение, обрываем цикл
					break
			elif k == 'win':                                # 2е особое условие, победа в игре
				if user_data_params[k] != achievement['params'][k]:   # проверяем чёткое соответствие
					get_achieve = False                     # если не выполенено соответствие
					break                                   # неполучаем достижение, обрываем цикл
			else:
				if user_data_params[k] < achievement['params'][k]:
														# для всех остальных условий применяем правило, больше - лучше
					get_achieve = False                     # если кол-во параметра меньше, чем в условии получения
					break                                   # не получаем достижение, обрываем цикл
		if get_achieve:
			received_achieves.append(key)                   # при получении достижения, добавляем его в список
	return received_achieves, user_data

print check_achievements(achievements, user_data)
# в результате будет видно, чт пользователь получит достижения 4 и 5, а 3 не получит